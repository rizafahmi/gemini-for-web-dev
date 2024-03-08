with import <nixpkgs> {};
let
  basePackages = [
    nodejs_20
  ];
in
  pkgs.mkShellNoCC {
    buildInputs = basePackages;
  }