package cat.apps4all.verbsirregulars;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

/** Còpia de seguretat del progrés: al compte de Google (si l'usuari ho tria) o en un fitxer .zip. */
@CapacitorPlugin(name = "Apps4AllBackup")
public class BackupPlugin extends Plugin {

    private static final String PREFS = "backup_choice";
    private static final String KEY = "google_backup";
    private static final String ENTRY = "progres.json";

    static boolean isGoogleBackupEnabled(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getBoolean(KEY, false);
    }

    @PluginMethod
    public void getGoogleBackup(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("enabled", isGoogleBackupEnabled(getContext()));
        call.resolve(ret);
    }

    @PluginMethod
    public void setGoogleBackup(PluginCall call) {
        boolean enabled = Boolean.TRUE.equals(call.getBoolean("enabled", false));
        getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putBoolean(KEY, enabled).apply();
        call.resolve();
    }

    /** Demana on desar el fitxer i hi escriu el progrés (json) dins d'un .zip. */
    @PluginMethod
    public void exportZip(PluginCall call) {
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT)
            .addCategory(Intent.CATEGORY_OPENABLE)
            .setType("application/zip")
            .putExtra(Intent.EXTRA_TITLE, call.getString("fileName", "VerbsIrregulars.zip"));
        startActivityForResult(call, intent, "exportResult");
    }

    @ActivityCallback
    private void exportResult(PluginCall call, ActivityResult result) {
        Uri uri = result.getData() != null ? result.getData().getData() : null;
        if (result.getResultCode() != Activity.RESULT_OK || uri == null) {
            call.resolve(saved(false));
            return;
        }
        try (OutputStream out = getContext().getContentResolver().openOutputStream(uri);
             ZipOutputStream zip = new ZipOutputStream(out)) {
            zip.putNextEntry(new ZipEntry(ENTRY));
            zip.write(call.getString("json", "{}").getBytes(StandardCharsets.UTF_8));
            zip.closeEntry();
            call.resolve(saved(true));
        } catch (Exception e) {
            call.reject("No s'ha pogut desar el fitxer", e);
        }
    }

    /** Demana el fitxer .zip i en retorna el progrés (json). */
    @PluginMethod
    public void importZip(PluginCall call) {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT)
            .addCategory(Intent.CATEGORY_OPENABLE)
            .setType("*/*")
            .putExtra(Intent.EXTRA_MIME_TYPES, new String[] {"application/zip", "application/octet-stream", "application/x-zip-compressed"});
        startActivityForResult(call, intent, "importResult");
    }

    @ActivityCallback
    private void importResult(PluginCall call, ActivityResult result) {
        Uri uri = result.getData() != null ? result.getData().getData() : null;
        JSObject ret = new JSObject();
        if (result.getResultCode() != Activity.RESULT_OK || uri == null) {
            call.resolve(ret);
            return;
        }
        try (InputStream in = getContext().getContentResolver().openInputStream(uri);
             ZipInputStream zip = new ZipInputStream(in)) {
            ZipEntry entry;
            while ((entry = zip.getNextEntry()) != null) {
                if (ENTRY.equals(entry.getName())) {
                    ByteArrayOutputStream buf = new ByteArrayOutputStream();
                    byte[] chunk = new byte[8192];
                    int n;
                    while ((n = zip.read(chunk)) > 0) buf.write(chunk, 0, n);
                    ret.put("json", buf.toString("UTF-8"));
                }
            }
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("No s'ha pogut llegir el fitxer", e);
        }
    }

    private static JSObject saved(boolean ok) {
        JSObject ret = new JSObject();
        ret.put("saved", ok);
        return ret;
    }
}
