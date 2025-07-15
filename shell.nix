with import <nixpkgs> {};

# Can probably remove a bunch of these packages
stdenv.mkDerivation {
    name = "node + C";

    nativeBuildInputs = [
        nodejs

        netcat-gnu

        gcc
        gnumake
        stdenv
        glibc
        pkg-config
    ];
    shellHook = ''
        export PATH="$PWD/node_modules/.bin/:$PATH"
    '';
}