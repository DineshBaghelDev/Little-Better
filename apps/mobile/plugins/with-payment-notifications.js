const fs = require("fs");
const path = require("path");
const {
  AndroidConfig,
  withAndroidManifest,
  withDangerousMod,
  withMainApplication,
} = require("@expo/config-plugins");

const moduleSource = String.raw`@file:Suppress("DEPRECATION", "OVERRIDE_DEPRECATION")

package com.littlebetter.app

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.provider.Settings
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.uimanager.ViewManager
import org.json.JSONArray

class PaymentNotificationsPackage : ReactPackage {
  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> =
    listOf(PaymentNotificationsModule(reactContext))

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> =
    emptyList()
}

class PaymentNotificationsModule(private val context: ReactApplicationContext) :
  ReactContextBaseJavaModule(context) {
  override fun getName() = "PaymentNotifications"

  @ReactMethod
  fun isAccessEnabled(promise: Promise) {
    val enabled = Settings.Secure.getString(context.contentResolver, "enabled_notification_listeners")
      ?.split(":")
      ?.mapNotNull(ComponentName::unflattenFromString)
      ?.any { it.packageName == context.packageName } == true
    promise.resolve(enabled)
  }

  @ReactMethod
  fun openSettings() {
    context.startActivity(Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS").apply {
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    })
  }

  @ReactMethod
  fun getPending(ownerId: String, promise: Promise) {
    val preferences = context.getSharedPreferences(STORE, Context.MODE_PRIVATE)
    val stored = preferences.getString(ITEMS, "[]") ?: "[]"
    val result = WritableNativeArray()
    val items = JSONArray(stored)
    for (index in 0 until items.length()) {
      val item = items.getJSONObject(index)
      if (item.optString("ownerId") != ownerId) continue
      result.pushMap(WritableNativeMap().apply {
        putString("key", item.getString("key"))
        putString("packageName", item.getString("packageName"))
        putDouble("postedAt", item.getLong("postedAt").toDouble())
        putString("text", item.getString("text"))
      })
    }
    promise.resolve(result)
  }

  @ReactMethod
  fun setOwner(ownerId: String?) {
    context.getSharedPreferences(STORE, Context.MODE_PRIVATE)
      .edit()
      .putString(ACTIVE_OWNER, ownerId)
      .apply()
  }

  @ReactMethod
  fun dismiss(key: String, promise: Promise) {
    val preferences = context.getSharedPreferences(STORE, Context.MODE_PRIVATE)
    val stored = JSONArray(preferences.getString(ITEMS, "[]") ?: "[]")
    val remaining = JSONArray()
    for (index in 0 until stored.length()) {
      val item = stored.getJSONObject(index)
      if (item.getString("key") != key) remaining.put(item)
    }
    preferences.edit().putString(ITEMS, remaining.toString()).apply()
    promise.resolve(null)
  }

  companion object {
    const val ACTIVE_OWNER = "active_owner"
    const val STORE = "payment_notifications"
    const val ITEMS = "items"
  }
}
`;

const listenerSource = String.raw`package com.littlebetter.app

import android.app.Notification
import android.content.Context
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import org.json.JSONArray
import org.json.JSONObject

class PaymentNotificationListener : NotificationListenerService() {
  override fun onNotificationPosted(notification: StatusBarNotification) {
    if (notification.packageName !in paymentApps) return
    val extras = notification.notification.extras
    val text = listOf(
      extras.getCharSequence(Notification.EXTRA_TITLE),
      extras.getCharSequence(Notification.EXTRA_TEXT),
      extras.getCharSequence(Notification.EXTRA_BIG_TEXT),
    ).mapNotNull { it?.toString()?.trim() }.filter { it.isNotEmpty() }.distinct().joinToString(". ")
    if (!amount.containsMatchIn(text) || !paymentWords.containsMatchIn(text)) return

    val preferences = getSharedPreferences(PaymentNotificationsModule.STORE, Context.MODE_PRIVATE)
    val ownerId = preferences.getString(PaymentNotificationsModule.ACTIVE_OWNER, null) ?: return

    val item = JSONObject().apply {
      put("key", notification.packageName + ":" + notification.id + ":" + notification.postTime)
      put("packageName", notification.packageName)
      put("postedAt", notification.postTime)
      put("text", text)
      put("ownerId", ownerId)
    }
    val existing = JSONArray(preferences.getString(PaymentNotificationsModule.ITEMS, "[]") ?: "[]")
    val updated = JSONArray().put(item)
    for (index in 0 until minOf(existing.length(), 49)) updated.put(existing.getJSONObject(index))
    preferences.edit().putString(PaymentNotificationsModule.ITEMS, updated.toString()).apply()
  }

  private companion object {
    val paymentApps = setOf(
      "com.google.android.apps.nbu.paisa.user",
      "com.phonepe.app",
      "net.one97.paytm",
    )
    val amount = Regex("(?i)(?:\\u20b9|rs\\.?|inr)\\s*[\\d,]+(?:\\.\\d{1,2})?")
    val paymentWords = Regex("(?i)\\b(paid|payment|debited|credited|sent|received|spent|transaction|refund|failed)\\b")
  }
}
`;

function withPaymentNotifications(config) {
  config = withAndroidManifest(config, (result) => {
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(result.modResults);
    app.service = app.service || [];
    if (!app.service.some((service) => service.$?.["android:name"] === ".PaymentNotificationListener")) {
      app.service.push({
        $: {
          "android:name": ".PaymentNotificationListener",
          "android:exported": "true",
          "android:label": "Payment detection",
          "android:permission": "android.permission.BIND_NOTIFICATION_LISTENER_SERVICE",
        },
        "intent-filter": [{
          action: [{ $: { "android:name": "android.service.notification.NotificationListenerService" } }],
        }],
      });
    }
    return result;
  });

  config = withMainApplication(config, (result) => {
    if (!result.modResults.contents.includes("PaymentNotificationsPackage()")) {
      const marker = "PackageList(this).packages.apply {";
      if (!result.modResults.contents.includes(marker)) {
        throw new Error("Unable to register PaymentNotificationsPackage in MainApplication.kt");
      }
      result.modResults.contents = result.modResults.contents.replace(
        marker,
        `${marker}\n          add(PaymentNotificationsPackage())`,
      );
    }
    return result;
  });

  return withDangerousMod(config, ["android", async (result) => {
    const target = path.join(
      result.modRequest.platformProjectRoot,
      "app/src/main/java/com/littlebetter/app",
    );
    await fs.promises.mkdir(target, { recursive: true });
    await Promise.all([
      fs.promises.writeFile(path.join(target, "PaymentNotificationsModule.kt"), moduleSource),
      fs.promises.writeFile(path.join(target, "PaymentNotificationListener.kt"), listenerSource),
    ]);
    return result;
  }]);
}

module.exports = withPaymentNotifications;
