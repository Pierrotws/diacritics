/* 
 * Copyright (C) 2024 Pierre Sauvage
 *
 * This file is part of Diacritics.
 *
 * Diacritics free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Diacritics distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Diacritics. If not, see <http://www.gnu.org/licenses/>.
*/

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as MessageTray from 'resource:///org/gnome/shell/ui/messageTray.js'

import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
//import St from 'gi://St';

let keyPressedTime = {};
let holdTimeout = null;
let threshold = 3000; // 3 seconds


// Import own libs:
import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

//import { Me } from './utils/me.js';

function showNotification(message) {
    Main.notify('Key Held Notification', message);
    //Main.notifyError('Key Held Notification', message);
}

export default class DiacriticsExtension extends Extension {
    /**
    * Called when the extension is first loaded (only once)
    */
    _init() {
        //Me().initTranslations();
    }
    
    /*
     * Called when the extension is activated (maybe multiple times)
     */
    enable() {
        global.stage.connect('key-press-event', this._onKeyPress);
        global.stage.connect('key-release-event', this._onKeyRelease);
        showNotification("ENABLE");
    }

    /**
     * Called when the extension is deactivated (maybe multiple times)
     */
    disable() {
        global.stage.disconnect('key-press-event', this._onKeyPress);
        global.stage.disconnect('key-release-event', this._onKeyRelease);
        showNotification("DISABLE");
    }

    _onKeyPress(actor, event) {
        let key = event.get_key_symbol();
        keyPressedTime[key] = Date.now();
        showNotification("KEYPRESS "+key);
        // Set a timeout for 3 seconds
        holdTimeout = GLib.timeout_add(GLib.PRIORITY_HIGH, threshold, () => {
            if (keyPressedTime[key] && (Date.now() - keyPressedTime[key] >= threshold)) {
                let duration = Date.now() - keyPressedTime[key];
                log(`Key ${key} held for ${duration} milliseconds`);
                // Show notification
                showNotification(`Key ${key} held for ${duration} milliseconds`);
            }
            return GLib.SOURCE_REMOVE;
        });
        return Clutter.EVENT_PROPAGATE;
    }

    _onKeyRelease(actor, event) {
        let key = event.get_key_symbol();
        keyPressedTime[key] = null;
        showNotification("KEYRELEASE "+key);
    
        if (holdTimeout) {
            GLib.source_remove(holdTimeout);
            holdTimeout = null;
        }
        return Clutter.EVENT_PROPAGATE;
    }

}
