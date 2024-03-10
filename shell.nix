with import <nixpkgs> {};
let
  basePackages = [
    nodejs_20
    turso-cli
    google-cloud-sdk
  ];
in
  pkgs.mkShellNoCC {
    buildInputs = basePackages;
  }