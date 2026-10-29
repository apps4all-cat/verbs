package cat.apps4all.verbsirregulars;

import android.speech.tts.TextToSpeech;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.Locale;

/** Pronuncia els verbs amb la veu anglesa del sistema (funciona sense Internet si la veu és instal·lada). */
@CapacitorPlugin(name = "Apps4AllSpeech")
public class SpeechPlugin extends Plugin {

    private TextToSpeech tts;
    private boolean ready = false;

    @Override
    public void load() {
        tts = new TextToSpeech(getContext(), status -> {
            if (status != TextToSpeech.SUCCESS) return;
            int result = tts.setLanguage(Locale.UK);
            if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                result = tts.setLanguage(Locale.US);
            }
            ready = result != TextToSpeech.LANG_MISSING_DATA && result != TextToSpeech.LANG_NOT_SUPPORTED;
        });
    }

    @PluginMethod
    public void speak(PluginCall call) {
        if (!ready) {
            call.reject("La veu anglesa no està disponible");
            return;
        }
        Double rate = call.getDouble("rate", 0.9);
        tts.setSpeechRate(rate == null ? 0.9f : rate.floatValue());
        tts.speak(call.getString("text", ""), TextToSpeech.QUEUE_FLUSH, null, "verb");
        call.resolve();
    }

    @PluginMethod
    public void available(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("available", ready);
        call.resolve(ret);
    }

    @Override
    protected void handleOnDestroy() {
        if (tts != null) {
            tts.stop();
            tts.shutdown();
        }
    }
}
