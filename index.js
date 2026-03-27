import {setFailed, info, getInput} from '@actions/core';
import os from 'os';
import child_process from 'child_process';

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
        await buildFunction(platform, imageName, imageTag, dockerFile, buildArg, load, context, target, label);
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

async function executeShellScript(scriptName, ...parameters) {
    parameters = (parameters || []).join(' ');
    const command = `docker_buildx/scripts/${scriptName}.sh ${parameters}`;
    child_process.execSync(command, { stdio: 'inherit' });
}

async function buildAndPublish(platform, imageName, imageTag, dockerFile, buildArg, load, context, target, label) {
    info('Running buildAndPublish')
    const dockerHubUser = extractInput('dockerHubUser', false);
    const dockerUser = extractInput('dockerUser', !dockerHubUser, dockerHubUser);
    const dockerHubPassword = extractInput('dockerHubPassword', false);
    const dockerPassword = extractInput('dockerPassword', !dockerHubPassword, dockerHubPassword);
    const dockerServer = extractInput('dockerServer', false, '');

    await executeShellScript('docker_login', dockerUser, dockerPassword, dockerServer);
    await executeShellScript('docker_build', platform, imageName, imageTag, dockerFile, true, buildArg, load, context, target, label);
}

async function buildOnly(platform, imageName, imageTag, dockerFile, buildArg, load, context, target, label) {
    info('Running buildOnly')
    await executeShellScript('docker_build', platform, imageName, imageTag, dockerFile, false, buildArg, load, context, target, label);
}

function cloneMyself() {
    info('Cloning action')
    child_process.execSync(`git clone https://github.com/ilteoood/docker_buildx`);
}

function cleanMyself() {
    child_process.execSync(`rm -rf docker_buildx`);
}

docker_buildx();
