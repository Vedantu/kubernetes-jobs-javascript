# kubernetes-job-javascript

Launching a job inside a kubernetes cluster and maintaining deployments is simplified

## Installation

```
npm install
```

## Initializing


To create the config required to make a client, you can either:

let kubernetes-client configure automatically by trying the `KUBECONFIG`
environment variable first, then `~/.kube/config`, then an in-cluster
service account, and lastly settling on a default proxy configuration:

The approach we’ve taken with kubernetes-client is to map path items (e.g., “namespace”) to chained objects, and to map path parameters (“path templates” in Swagger terminology) to function arguments. We add HTTP operations (like “GET”) as methods on the chained objects. The end result is an interface where the API calls you make in Node.js closely resemble the paths and descriptions in the Kubernetes API reference documentation.

To make this more concrete, here’s a snippet for initializing a kubernetes-client instance and fetching all the Deployments in the default Namespace:

```js
const Client = require('kubernetes-client').Client;
const config = require('kubernetes-client').config;

const client = new Client({ config: config.fromKubeconfig(), version: '1.9' });
const deployments = await client.api.v1.namespaces('default').deployments.get();
```

With kubernetes-client 5.0.0 we added support for generating these bindings dynamically from your kube-apiserver’s swagger.json. You can now do the following to get a client that matches the operations your Kubernetes cluster supports:

```js
const client = new Client({ config: config.fromKubeconfig() });
await client.loadSpec()
```

It is often useful to track the state of your Deployments outside of your Kubernetes API. For example, there is a New Relic API to record changes to Deployments. If your automation deploys a new image, or if a Horizontal Pod Autoscaler scales out a Deployment, automatically notifying New Relic makes it easy to track potential performance improvements or regressions. Many third party services offer similar APIs for notifying them about changes to deployed services (e.g., GitHub Deployments, ServiceNow Change Requests, GitLab deployments, Slack Incoming Webhooks, …).

We wrote an example, called the Deployment Notifier, that logs messages to the console when specific Deployments change. Deployment Notifier uses a DeploymentNotifier Custom Resource Definition (CRD) to allow Kubernetes users to specify which Deployments they want notifications on, and a custom controller implemented with kubernetes-client to process DeploymentNotifiers and “notify” the console at the right time.

Extending the API with a DeploymentNotifier
The first thing our custom controller does is create an API client and attempt to extend the Kubernetes API by creating a DeploymentNotifier CRD. We create the DeploymentNotifier in the controller to make it easy to install Deployment Notifier on a new Kubernetes cluster simply by running the controller.

```js
async function main() {
  try {
    const client = new Client({ config: config.fromKubeconfig() });
    await client.loadSpec();

    //
    // Create the CRD if it doesn't already exist.
    //
    try {
      await client.apis['apiextensions.k8s.io'].v1beta1.customresourcedefinitions.post({ body: crd });
    } catch (err) {
      //
      // API returns a 409 Conflict if CRD already exists.
      //
      if (err.statusCode !== 409) throw err;
    }

    //
    // Add endpoints to our client
    //
    client.addCustomResourceDefinition(crd);

    //
    // Watch DeploymentNotifiers.
    //
    watchDeploymentNotifiers();
  } catch (err) {
    console.error('Error: ', err);
  }
}

```

## Launch Jobs with the api configuration
Make sure you have kubeconfig set up refer to kubeconfig.yaml and install kubectl and do a kube configuration
on the running machine so that you can launch jobs from that machine.

The below configuration takes config from the .kube/<config-file-name>

```js
const client = new Client({
    config: config.fromKubeconfig(),
    version: '1.10'
});
```
## Job API
ns stands for namespace and add you namespace accordingly for scaling and this is a post API because kube has to place a job inside the cluster.
It returns 409 conflict if the job with same name already exists
```js
  client.apis.batch.v1.ns('<put your namespace name>').jobs.post({ body: launchParameters });
```
## Steps for setting the flow
* Create your kubernetes cluster (any cloud provider)
* Create kube configuration on our servers from where you are going to launch a job
* utilisize the yaml config and kubejob inside the folder given
  
## License

[MIT](LICENSE)

[1]: https://swagger.io/specification/#pathItemObject
[2]: https://swagger.io/specification/#pathTemplating
