with import <nixpkgs> {};
let
  basePackages = [
    nodejs_20
    turso-cli
  ];
in
  pkgs.mkShellNoCC {
    buildInputs = basePackages;
  }