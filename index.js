import { getInput, info, setFailed } from '@actions/core';
import child_process from 'child_process';
import os from 'os';

async function docker_buildx() {
    try {
        checkPlatform();
        cloneMyself();
        const imageName = extractInput('imageName', true);
        await executeShellScript('install_buildx');
        const imageTag = extractInput('tag', false, 'latest');
        const dockerFile = extractInput('dockerFile', false, 'Dockerfile');
        const publish = extractInput('publish', false, 'false').toLowerCase() === 'true';
        const load = extractInput('load', false, 'false').toLowerCase() === 'true';
        const platform = extractInput('platform', false, 'linux/amd64,linux/arm64,linux/arm/v7');
        const buildArg = extractInput('buildArg', false, '');
        const target = extractInput('target', false, '');
        const label = extractInput('label', false, '');
        const context = extractInput('context', false, '.');
        const buildFunction = publish ? buildAndPublish : buildOnly;
        await buildFunction(platform, imageName, imageTag, dockerFile, buildArg, label, load, context, target);
        cleanMyself();
    } catch (error) {
        setFailed(error.message);
    }
}

function checkPlatform() {
    info('Checking platform')
    if (os.platform() !== 'linux') {
        throw new Error('Only supported on linux platform');
    }
}

function extractInput(inputName, required, defaultValue) {
    const inputValue = getInput(inputName);
    if (required) checkRequiredInput(inputName, inputValue);
    return inputValue ? inputValue : defaultValue;
}

function checkRequiredInput(inputName, inputValue) {
    if (!inputValue) {
        throw new Error(`The parameter ${inputName} is missing`);
    }
}

async function executeShellScript(scriptName, envVars = {}) {
    const command = `docker_buildx/scripts/${scriptName}.sh`;
    child_process.execSync(command, { stdio: 'inherit', env: { ...process.env, ...envVars } });
}

async function buildAndPublish(platform, imageName, imageTag, dockerFile, buildArg, label, load, context, target) {
    const dockerHubUser = extractInput('dockerHubUser', false);
    const dockerUser = extractInput('dockerUser', !dockerHubUser, dockerHubUser);
    const dockerHubPassword = extractInput('dockerHubPassword', false);
    const dockerPassword = extractInput('dockerPassword', !dockerHubPassword, dockerHubPassword);
    const dockerServer = extractInput('dockerServer', false, '');

    info('Running login')
    await executeShellScript('docker_login', {
        INPUT_DOCKER_USER: dockerUser,
        INPUT_DOCKER_PASSWORD: dockerPassword,
        INPUT_DOCKER_SERVER: dockerServer,
    });
    await buildOnly(platform, imageName, imageTag, dockerFile, buildArg, label, load, context, target);
}

async function buildOnly(platform, imageName, imageTag, dockerFile, buildArg, label, load, context, target) {
    info('Running build')
    await executeShellScript('docker_build', {
        INPUT_PLATFORM: platform,
        INPUT_IMAGE_NAME: imageName,
        INPUT_TAG: imageTag,
        INPUT_DOCKERFILE: dockerFile,
        INPUT_PUSH: 'false',
        INPUT_BUILD_ARG: buildArg,
        INPUT_LABEL: label,
        INPUT_LOAD: String(load),
        INPUT_CONTEXT: context,
        INPUT_TARGET: target,
    });
}

function cloneMyself() {
    info('Cloning action')
    child_process.execSync(`git clone https://github.com/ilteoood/docker_buildx`);
}

function cleanMyself() {
    child_process.execSync(`rm -rf docker_buildx`);
}

docker_buildx();
