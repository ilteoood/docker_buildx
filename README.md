# docker_buildx

GitHub Action to build and publish images using [Docker Buildx](https://docs.docker.com/buildx/working-with-buildx/).

## Inputs
The accepted inputs are:

| Name          | Type      | Default   | Mandatory   |  Description                                                    |
|---------------|-----------|-----------|-------------|-----------------------------------------------------------------|
| `tag`         | String    | `latest`  | No          | Tag to apply to the image                                       |
| `imageName`   | String    |   | Yes         | Name of the image                                               |
| `publish`     | Boolean   | `false`   | No          | Indicate if the builded image should be published on Docker HUB |  
| `platform`    | String    | `linux/amd64,linux/arm64,linux/arm/v7`  | No         | Platforms (*comma separated*) that should be used to build the image |                 |
| `dockerHubUser`   | String    |   | Only if `publish` is true         | User that will publish the image                 |
| `dockerHubPassword`   | String    |   | Only if `publish` is true         | Password of the `dockerHubUser`                 |