{pkgs}: {
  channel = "stable-23.11";
  packages = [
    pkgs.nodejs_18
    pkgs.postgresql_14
    pkgs.nano
    pkgs.podman
  ];
  idx.extensions = [
    "angular.ng-template"
    "nrwl.angular-console"
    "esbenp.prettier-vscode"
    "firsttris.vscode-jest-runner"
    "dbaeumer.vscode-eslint"
    "mtxr.sqltools"
    "mtxr.sqltools-driver-pg"
    "mhutchie.git-graph"
  ];
  idx.workspace = {
      # Runs when a workspace has started
      onStart = {
        start = "source .idx/on-start.sh";
        start-db = "/usr/bin/pg_ctl -D ../pgdata -l tmp/logfile start"; 
      };
      # Runs when a workspace is first created with this `dev.nix` file
      onCreate = {
        pg-init-db = "initdb --pgdata=../pgdata --username=tskmgr";
        pg-start = "/usr/bin/pg_ctl -D ../pgdata -l tmp/logfile start";
        pg-create-db-tskmgr_dev = "createdb -h localhost -p 5432 -U tskmgr tskmgr_dev";
        pg-create-db-tskmgr = "createdb -h localhost -p 5432 -U tskmgr tskmgr";
      };
    };
}