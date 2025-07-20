/**
 * Creates a GitHub issue when API changes are detected
 * This script is called from the GitHub Actions workflow
 */

module.exports = async ({ github, context, core }) => {
  try {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const lowCount = process.env.LOW_COUNT || '0';
    const goodCount = process.env.GOOD_COUNT || '0';
    const totalItems = process.env.TOTAL_ITEMS || '0';
    const workflowUrl = `${context.payload.repository.html_url}/actions/runs/${context.runId}`;
    const resultsUrl = process.env.RESULTS_URL || '';
    
    const issueTitle = `🚨 API Change Detected - ${now} UTC`;
    
    let issueBody = '## API Change Detection Alert\n\n';
    issueBody += `**Detection Time:** ${now} UTC\n`;
    issueBody += `**Workflow Run:** [View Details](${workflowUrl})\n\n`;
    issueBody += '### 📊 Current Data Summary\n';
    issueBody += `- **Low Items:** ${lowCount}\n`;
    issueBody += `- **Good Items:** ${goodCount}\n`;
    issueBody += `- **Total Items:** ${totalItems}\n\n`;
    issueBody += '### 🔗 Additional Information\n';
    
    if (resultsUrl) {
      issueBody += `- [View Full Results](${resultsUrl})\n\n`;
    } else {
      issueBody += '- No results URL configured\n\n';
    }
    
    issueBody += '### 🔍 What This Means\n';
    issueBody += 'The API monitoring system detected a change in the response data (excluding timestamp/clock updates). ';
    issueBody += 'This indicates that the actual content of the API has been modified since the last check.\n\n';
    issueBody += '### ⏰ Monitoring Details\n';
    issueBody += '- **Check Frequency:** Every 30 minutes\n';
    issueBody += `- **Last Change:** ${now} UTC\n`;
    issueBody += '- **Change Detection:** Hash-based comparison (clock field ignored)\n\n';
    issueBody += '---\n';
    issueBody += '*This issue was automatically created by the API monitoring workflow. ';
    issueBody += 'The workflow runs every 30 minutes to detect meaningful changes in the API response.*';

    const issue = await github.rest.issues.create({
      owner: context.repo.owner,
      repo: context.repo.repo,
      title: issueTitle,
      body: issueBody,
      labels: ['api-change', 'automated', 'alert']
    });

    core.info(`Created issue #${issue.data.number}: ${issueTitle}`);
    core.setOutput('issue_number', issue.data.number);
    core.setOutput('issue_url', issue.data.html_url);
    
  } catch (error) {
    core.setFailed(`Failed to create GitHub issue: ${error.message}`);
  }
};
