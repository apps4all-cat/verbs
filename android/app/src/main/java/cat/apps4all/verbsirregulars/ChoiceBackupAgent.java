package cat.apps4all.verbsirregulars;

import android.app.backup.BackupAgent;
import android.app.backup.BackupDataInput;
import android.app.backup.BackupDataOutput;
import android.app.backup.FullBackupDataOutput;
import android.os.ParcelFileDescriptor;
import java.io.IOException;

/**
 * Còpia de seguretat d'Android només si l'usuari l'ha activada (pantalla «Còpia de seguretat» del joc).
 * Si no, no es copia res: el progrés no surt del mòbil i es pot passar a un altre amb l'exportació .zip.
 */
public class ChoiceBackupAgent extends BackupAgent {

    @Override
    public void onFullBackup(FullBackupDataOutput data) throws IOException {
        if (BackupPlugin.isGoogleBackupEnabled(this)) super.onFullBackup(data);
    }

    // Només es fa servir la còpia completa (fullBackupOnly); la de clau-valor queda buida.
    @Override
    public void onBackup(ParcelFileDescriptor oldState, BackupDataOutput data, ParcelFileDescriptor newState) {}

    @Override
    public void onRestore(BackupDataInput data, int appVersionCode, ParcelFileDescriptor newState) {}
}
