with import <nixpkgs> {};

stdenv.mkDerivation {
    name = "node + C";

    nativeBuildInputs = [
        nodejs

        getopt
        flex
        bison
        gcc
        gnumake
        stdenv
        glibc
        bc
        pkg-config
        binutils
    ];
    buildInputs = [
        elfutils
        ncurses
        openssl
        zlib
    ];
    shellHook = ''
        export PATH="$PWD/node_modules/.bin/:$PATH"
    '';
}