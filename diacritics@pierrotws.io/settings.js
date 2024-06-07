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

import Gio from 'gi://Gio';

import { KEY_DELAY, MY_SCHEMA } from './define.js';

/**
 * This class takes care of reading/writing the settings from/to the GSettings backend.
 */
export class Settings {

    /**
     * Creates a new Settings-object to access the settings of this extension.
     * @param extension this extension
     */
    constructor(extension) {
        let schemaDir = extension.dir.get_child('schemas').get_path();

        let schemaSource = Gio.SettingsSchemaSource.new_from_directory(
            schemaDir, Gio.SettingsSchemaSource.get_default(), false
        );
        let schema = schemaSource.lookup(MY_SCHEMA, false);

        this._settings = new Gio.Settings({
            settings_schema: schema
        });
    }
    
    /**
     * <p>Binds the given 'callback'-function to the "changed"-signal on the given
     *  key.</p>
     * <p>The 'callback'-function is passed an argument which holds the new
     *  value of 'key'. The argument is of type "GLib.Variant". Given that the
     *  receiver knows the internal type, use one of the get_XX()-methods to get
     *  it's actual value.</p>
     * @see http://www.roojs.com/seed/gir-1.2-gtk-3.0/gjs/GLib.Variant.html
     * @param key the key to watch for changes.
     * @param callback the callback-function to call.
     */
    bindKey(key, callback) {
        // Validate:
        if (key === undefined || key === null || typeof key !== "string"){
            throw TypeError("The 'key' should be a string. Got: '"+key+"'");
        }
        if (callback === undefined || callback === null || typeof callback !== "function"){
            throw TypeError("'callback' needs to be a function. Got: "+callback);
        }
        // Bind:
        this._settings.connect("changed::"+key, function(source, key){
            callback( source.get_value(key) );
        });
    }

    /**
     * Get the delay (in minutes) between the wallpaper-changes.
     * @returns int the delay in minutes.
     */
    getDelay() {
        var minutes = this._settings.get_int(KEY_DELAY);
        if (!valid_minutes(minutes)) {
                this.setDelay(DELAY_MINUTES_DEFAULT);
                return DELAY_MINUTES_DEFAULT;
        }
        return minutes;
    }

    /**
     * Set the new delay in minutes.
     * @param delay the new delay (in minutes).
     * @throws TypeError if the given delay is not a number or less than 1
     */
    setDelay(delay) {
        // Validate:
        if (delay === undefined || delay === null || typeof delay !== "number") {
            throw TypeError("delay should be a number. Got: "+delay);
        }
        // Set:
        let key = KEY_DELAY;
        if (this._settings.get_int(key) == delay) { return; }
        if (this._settings.is_writable(key)){
            if (this._settings.set_int(key, delay)){
                Gio.Settings.sync();
            } else {
                throw this._errorSet(key);
            }
        } else {
            throw this._errorWritable(key);
        }
    }

    
    /**
     * Write dconf string property in various dconf paths
     * @param setting the dconf destination path.
     * @param key the dconf key
     * @param value the string value to write
     * @throws Custom erros
     */
    _writeKey(setting, key, value) {
        if (setting.is_writable(key)) {
            if (!setting.set_string(key, value)) {
                throw this._errorSet(key);
            }
        } else {
            throw this._errorWritable(key);
        }
    }

    _errorWritable(key) {
        return "The key '"+key+"' is not writable.";
    }

    _errorSet(key) {
        return "Couldn't set the key '"+key+"'";
    }
}
