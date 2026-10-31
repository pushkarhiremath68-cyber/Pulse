package app.pulsemusic.player;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.Bundle;
import android.webkit.WebSettings;

import androidx.core.app.NotificationCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private static final String CHANNEL_ID = "pulse_playback_channel";
    private static final int NOTIFICATION_ID = 1001;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        createNotificationChannel();
    }

    @Override
    public void onPause() {
        super.onPause();
        // Prevent WebView from pausing when the app goes into the background
        // This allows HTML5 audio (and navigator.mediaSession) to continue playing.
        if (bridge != null && bridge.getWebView() != null) {
            bridge.getWebView().resumeTimers();
            bridge.getWebView().onResume();

            // Enable mixed content and media playback settings for background audio
            WebSettings settings = bridge.getWebView().getSettings();
            settings.setMediaPlaybackRequiresUserGesture(false);
        }

        // Start a foreground notification to keep the process alive
        startKeepAliveNotification();
    }

    @Override
    public void onResume() {
        super.onResume();
        // Stop the keep-alive notification when the app is in the foreground
        stopKeepAliveNotification();
    }

    @Override
    public void onDestroy() {
        stopKeepAliveNotification();
        super.onDestroy();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Pulse Music Playback",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Keeps music playing in the background");
            channel.setSound(null, null);
            channel.setShowBadge(false);

            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    private void startKeepAliveNotification() {
        try {
            Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Pulse Music")
                .setContentText("Playing in background")
                .setSmallIcon(android.R.drawable.ic_media_play)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setOngoing(true)
                .setSilent(true)
                .setCategory(NotificationCompat.CATEGORY_SERVICE)
                .build();

            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.notify(NOTIFICATION_ID, notification);
            }
        } catch (Exception e) {
            // Notification permission may not be granted — graceful fallback
        }
    }

    private void stopKeepAliveNotification() {
        try {
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.cancel(NOTIFICATION_ID);
            }
        } catch (Exception e) {
            // Ignore
        }
    }
}
