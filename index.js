const core = require('@actions/core');
const os = require('os');
const child_process = require('child_process');

async function docker_buildx() {
    try {
        checkPlatform();
        cloneMyself();
        await executeShellScript('install_buildx');
        await buildFunction();
        cleanMyself();
    } catch (error) {
        core.setFailed(error.message);
    }
}

function checkPlatform() {
    if (os.platform() !== 'linux') {
        throw new Error('Only supported on linux platform');
    }
}

function extractInput(inputName, required, defaultValue) {
    const inputValue = core.getInput(inputName);
    if(required) checkRequiredInput(inputName, inputValue);
    return inputValue ? inputValue : defaultValue;
}

function checkRequiredInput(inputName, inputValue) {
    if (!inputValue) {
        throw new Error(`The parameter ${inputName} is missing`);
    }
}

async function executeShellScript(scriptName, ...parameters) {
    parameters = (parameters || []).join(' ');
    command = `docker_buildx/scripts/${scriptName}.sh ${parameters}`;
    console.log(`Executing: ${command}`);
    child_process.execSync(command, {stdio: 'inherit'});
}

async function buildFunction() {
    // Parse input parameters
    var imageName = extractInput('imageName', true);
    var imageTag = extractInput('tag', false, 'latest');
    var dockerFile = extractInput('dockerFile', false, 'Dockerfile');
    var buildArg = extractInput('buildArg', false, 'none');
    var platform = extractInput('platform', false, 'linux/amd64,linux/arm64,linux/arm/v7');
    var publish = extractInput('publish', false, 'false').toLowerCase() === 'true';

    var dockerArgs = "--platform " + platform;

    if (publish) {
        const dockerHubUser = extractInput('dockerHubUser', true);
        const dockerHubPassword = extractInput('dockerHubPassword', true);
        await executeShellScript('docker_login', dockerHubUser, dockerHubPassword);
        dockerArgs += " --push";
    }

    if (buildArg !== 'none') {
        var args = buildArg.split(",");
        for(var i = 0; i < args.length; i++) {
            dockerArgs += " --build-arg " + args[i];
        }
    }

    var tags = imageTag.split(",");
    for (var i = 0; i < tags.length; i++) {
        dockerArgs += " --tag " + imageName + ":" + tags[i];
    }
    dockerArgs += " -f " + dockerFile;
    await executeShellScript('docker_build', dockerArgs);
}

function cloneMyself() {
    child_process.execSync(`git clone https://github.com/ilteoood/docker_buildx`);
}

function cleanMyself() {
    child_process.execSync(`rm -rf docker_buildx`);
}

docker_buildx();
