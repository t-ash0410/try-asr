{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    { nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        gcloud = pkgs.google-cloud-sdk.withExtraComponents [ 
          pkgs.google-cloud-sdk.components.gke-gcloud-auth-plugin 
        ];
      in
      {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            bun
            go
            mkcert
            gcloud
          ];
        };
      }
    );
}
