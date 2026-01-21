#!/bin/bash

set -e

host="$1"
shift
cmd="$@"

until PGPASSWORD=emc3_local_pass psql -h "$host" -U "emc3_user" -d "emc3_dev" -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - executing command"
exec $cmd

