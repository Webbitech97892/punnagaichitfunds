package com.suriyadev;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.widget.TextView;

public class splashActivity extends AppCompatActivity {
    @Override
    public void onPause() {
        super.onPause();
        finish();
    }
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash);

        TextView splashVersion = findViewById(R.id.splash_version);
        if (splashVersion != null) {
            splashVersion.setText("Secure Financial Services • v" + BuildConfig.VERSION_NAME);
        }

        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                Intent intent = new Intent(splashActivity.this, MainActivity.class);
                startActivity(intent);
                splashActivity.this.finish();
            }
        }, 1800);
    }
}