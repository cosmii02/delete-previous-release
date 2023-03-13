async function run() {
  try {
    const token = core.getInput('token');
    const octokit = github.getOctokit(token);
    const eventName = github.context.eventName;

    if (eventName === 'release') {
      const { data: releases } = await octokit.rest.repos.listReleases({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
      });

      // Find the latest pre-release
      const latestPreRelease = releases.filter(release => release.prerelease).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

      // Find the release before the latest one
      const previousRelease = releases.filter(release => !release.prerelease && release.id !== latestPreRelease.id).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

      // Check if there is a release to delete
      if (previousRelease) {
        // Delete the release before the latest one
        await octokit.rest.repos.deleteRelease({
          owner: github.context.repo.owner,
          repo: github.context.repo.repo,
          release_id: previousRelease.id,
        });
        core.setOutput('deleted', true);
      } else {
        core.setOutput('deleted', false);
      }
    } else {
      core.setFailed('This action can only be triggered by a release event.');
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
