package cat.apps4all.verbsirregulars;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Plugins propis (còpia de seguretat i veu): s'han de registrar abans de crear el pont amb la web.
        registerPlugin(BackupPlugin.class);
        registerPlugin(SpeechPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
