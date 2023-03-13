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

      // Find the oldest pre-release
      const oldestPreRelease = releases.filter(release => release.prerelease).sort((a, b) => new Date(a.created_at) - new Date(b.created_at))[0];

      // Check if there is an older pre-release to delete
      if (oldestPreRelease) {
        // Delete the oldest pre-release
        await octokit.rest.repos.deleteRelease({
          owner: github.context.repo.owner,
          repo: github.context.repo.repo,
          release_id: oldestPreRelease.id,
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
