import { getInput, info, setFailed } from '@actions/core';
import child_process from 'child_process';
import os from 'os';

async function docker_buildx() {
    try {
        checkPlatform();
        cloneMyself();
        await executeShellScript('install_buildx');
        await build();
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

async function executeShellScript(scriptName, envVars = {}) {
    const command = `docker_buildx/scripts/${scriptName}.sh`;
    child_process.execSync(command, { stdio: 'inherit', env: { ...process.env, ...envVars } });
}

function extractInputs() {
    return {
        imageName: getInput('imageName', { required: true }),
        imageTag: getInput('tag'),
        dockerFile: getInput('dockerFile'),
        publish: getInput('publish').toLowerCase() === 'true',
        load: getInput('load').toLowerCase() === 'true',
        platform: getInput('platform'),
        buildArg: getInput('buildArg'),
        target: getInput('target'),
        label: getInput('label'),
        context: getInput('context'),
    }
}

async function build() {
    const { platform, imageName, imageTag, dockerFile, publish, buildArg, label, load, context, target } = extractInputs();

    if (publish) {
        const dockerUser = getInput('dockerUser', { required: true });
        const dockerPassword = getInput('dockerPassword', { required: true });
        const dockerServer = getInput('dockerServer', { required: false });

        info('Running login')
        await executeShellScript('docker_login', {
            INPUT_DOCKER_USER: dockerUser,
            INPUT_DOCKER_PASSWORD: dockerPassword,
            INPUT_DOCKER_SERVER: dockerServer,
        });
    }

    info('Running build')
    await executeShellScript('docker_build', {
        INPUT_PLATFORM: platform,
        INPUT_IMAGE_NAME: imageName,
        INPUT_TAG: imageTag,
        INPUT_DOCKERFILE: dockerFile,
        INPUT_PUSH: String(publish),
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
