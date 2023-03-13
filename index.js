const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    const token = core.getInput('token');
    const octokit = github.getOctokit(token);
    const { data: releases } = await octokit.rest.repos.listReleases({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
    });
    
    // Get the previous release
    const prevRelease = releases.find(release => release.id === github.context.payload.release.id - 1);
    
    // Check if the previous release is a pre-release
    if (prevRelease && prevRelease.prerelease) {
      // Delete the previous release
      await octokit.rest.repos.deleteRelease({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        release_id: prevRelease.id,
      });
      core.setOutput('deleted', true);
    } else {
      core.setOutput('deleted', false);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();

