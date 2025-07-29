with import <nixpkgs> {};

stdenv.mkDerivation {
    name = "node";
    buildInputs = [
        nodejs
        gcc
        libwebsockets
        glib
        openssl
        cmake
    ];
    shellHook = ''
        export PATH="$PWD/node_modules/.bin/:$PATH"
    '';
}