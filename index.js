const core = require('@actions/core');
const os = require('os');
const child_process = require('child_process');

async function docker_buildx() {
    try {
        checkPlatform();
        const imageName = extractInput('imageName', true);
        await executeShellScript('install_buildx');
        const imageTag = extractInput('tag', false, 'latest');
        const publish = core.getInput('publish');
        const platform = extractInput('platform', false, 'linux/amd64,linux/arm64,linux/arm/v7');
        const buildFunction = publish ? buildAndPublish : buildOnly;
        buildFunction(platform, imageName, imageTag);
    } catch (error) {
        core.setFailed(error.message);
    }
}

function checkPlatform() {
    if (os.platform() !== 'linux') {
        throw new Error('Only supported on linux platform')
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
    command = `./scripts/${scriptName}.sh ${parameters}`;
    console.log(`Executing: ${command}`);
    output = child_process.execSync(`./scripts/${scriptName}.sh ${parameters}`);
    console.log(`Output: ${output}`);
}

async function buildAndPublish(platform, imageName, imageTag) {
    const dockerHubUser = extractInput('dockerHubUser', true);
    const dockerHubPassword = extractInput('dockerHubPassword', true);
    await executeShellScript('dockerhub_login', dockerHubUser, dockerHubPassword);
    await executeShellScript('docker_build_push', platform, imageName, imageTag);
}

async function buildOnly(platform, imageName, imageTag) {
    await executeShellScript('docker_build', platform, imageName, imageTag);
}

docker_buildx();