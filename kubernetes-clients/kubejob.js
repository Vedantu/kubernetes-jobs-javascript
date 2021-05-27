const { Client, config } = require('kubernetes-client');

const client = new Client({
    config: config.fromKubeconfig(),
    version: '1.10'
});

async function createOtfSessionJobInKube() {
    let launchParameters = {
        'apiVersion': 'batch/v1',
        'kind': 'Job',
        'metadata': {
            "name": '/* add a custom name here */'
        },
        'spec': {
            'template': {
                'metadata': {
                    'name': `/* add a custom name for your template metadat here */`
                },
                'spec': {
                    'containers': [{
                        'name': '/* put your container name */',
                        'image': '/* put you image repository link either from docker hub or ecr */',
                        'command': [
                            '/* add the container starter command if you have any */'
                        ],
                        'args': [
                            '/* put your container arguments you have any */'
                        ]
                    }],
                    'restartPolicy': 'OnFailure/Never'
                }
            }
        }
    }
    try {
        //
        // Create the job if it doesn't already exist and add endpoints to our client
        //
        const launchResponse = await client.apis.batch.v1.ns('<put your namespace here>').jobs.post({ body: launchParameters });
        return launchResponse;
    } catch (err) {
        //
        // API returns a 409 Conflict if job already exists.
        //
        if (err.statusCode === 409) {
            //handle here accordingly
        }
    }
}


