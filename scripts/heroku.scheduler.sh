
#!/bin/sh -e

(
  PROJECT_ROOT="$(cd $(dirname $0)/..; pwd)"

  cd $PROJECT_ROOT
  yarn workspace @podcast-flows/api run renew-podcasts
  
)