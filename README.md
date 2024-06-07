# Diacritics gnome extension

//TODO

## Installation

### Manual installation

If you need to "install" the extension manually, you'll need the following utilities:

* `git`
* `glib-compile-schemas`
* `gnome-tweak-tool` (Optional)

The packages which include the above tools may vary across different Linux distributions. Check your distributions wiki/package list to find the most suitable package for you.

There are multiple stable branches, depending on the version of GnomeShell you're running. Check the `DEVELOPMENT.md`-file for information on those branches. To build the extension, follow these steps:

    ```bash
    # Clone the repository (you might already did this!)
    git clone https://github.com/Pierrotws/diacritics.git
    cd diacritics
    # "Compile" the settings-schema:
    glib-compile-schemas diacritics\@pierrotws.io/schemas/
    # Copy the files over to the local extension directory:
    cp -r diacritics\@pierrotws.io/ ~/.local/share/gnome-shell/extensions/
    ```

Afterwards, you can activate the extension either by using the `gnome-tweak-tool` or at [extensions.gnome.org/local](https://extensions.gnome.org/local/)

## Settings

All settings can be changed from the `gnome-shell-extension-prefs`-tool or from the command line. Although you can set them using the `dconf`-tool, **using the frontend/widget is preferred!**.

* **Delay (in minutes) between wallpaper changes:** (*default*: `3`)

`dconf write /org/gnome/shell/extensions/caravel/delay 3`

