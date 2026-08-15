# VS Code Marketplace authentication from GitHub Actions

Scope: public, supported authentication paths available on August 15, 2026. Sources are Microsoft, GitHub, and the official `microsoft/vscode-vsce` repository and npm package.

## Conclusion

Invariant uses an existing Marketplace token with [`HaaLeo/publish-vscode-extension@v2`](https://github.com/marketplace/actions/publish-vs-code-extension), passed through the `VS_MARKETPLACE_TOKEN` GitHub Actions secret. The action publishes the already-built VSIX through VSCE.

For a new setup without an existing Marketplace token, use **Microsoft Entra workload identity federation** with a user-assigned managed identity, `azure/login`, and `vsce publish --azure-credential`.

Do not use `vsce publish --oidc` yet. OIDC trusted publishing exists in VSCE's prerelease code, but Microsoft deliberately [hid the option as unannounced](https://github.com/microsoft/vscode-vsce/commit/a211177) on August 5, 2026. The current stable package is [`@vscode/vsce` 3.9.2](https://www.npmjs.com/package/@vscode/vsce?activeTab=versions); its CLI supports `--azure-credential`, not `--oidc`. This also explains why there is no usable trusted-publishing-policy UI in the Marketplace.

A PAT is only a temporary path for somebody who already owns a suitable global PAT. Microsoft blocked creation and regeneration of global PATs on March 15, 2026 and will disable all remaining global PATs on December 1, 2026. See Microsoft's [global PAT retirement announcement](https://devblogs.microsoft.com/devops/retirement-of-global-personal-access-tokens-in-azure-devops/).

## New setup: Entra federation from GitHub Actions

Microsoft's Marketplace guide requires a user-assigned managed identity with the Reader role, then adding that identity to the Marketplace publisher as a Contributor. It publishes with [`vsce publish --azure-credential`](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#secure-automated-publishing-to-visual-studio-marketplace). Microsoft separately documents that `azure/login` can federate a GitHub-hosted Actions runner to a user-assigned managed identity. Combining those two supported mechanisms avoids both a PAT and a client secret.

### Azure resources

Create one resource group and one user-assigned managed identity. These names are local choices:

```sh
az login
az account set --subscription '<subscription-id>'

az group create \
  --name invariant-colors-marketplace \
  --location westeurope

az identity create \
  --name invariant-colors-github \
  --resource-group invariant-colors-marketplace \
  --location westeurope
```

Record the identity and subscription values:

```sh
az identity show \
  --name invariant-colors-github \
  --resource-group invariant-colors-marketplace \
  --query '{clientId:clientId,principalId:principalId,tenantId:tenantId}'

az account show --query '{subscriptionId:id,tenantId:tenantId}'
```

Assign the identity the Reader role required by the Marketplace guide:

```sh
az role assignment create \
  --assignee-object-id '<principalId>' \
  --assignee-principal-type ServicePrincipal \
  --role Reader \
  --scope '/subscriptions/<subscription-id>'
```

Managed identities support federated credentials from GitHub Actions; Microsoft documents both the [portal setup and exact identity values](https://learn.microsoft.com/en-us/entra/workload-id/workload-identity-federation-create-trust-user-assigned-managed-identity#github-actions-deploying-azure-resources).

### GitHub trust boundary

Create a GitHub environment named `vscode-marketplace`, and make the publishing job use:

```yaml
environment: vscode-marketplace
permissions:
  contents: read
  id-token: write
```

Using an environment gives every release the same OIDC subject instead of requiring a federated credential for each tag. Create the credential:

```sh
az identity federated-credential create \
  --name invariant-colors-github-release \
  --identity-name invariant-colors-github \
  --resource-group invariant-colors-marketplace \
  --issuer 'https://token.actions.githubusercontent.com' \
  --subject 'repo:andrebrait/invariant-colors:environment:vscode-marketplace' \
  --audiences 'api://AzureADTokenExchange'
```

The environment name in the job and the federated credential must match exactly. Microsoft documents this [environment subject form](https://learn.microsoft.com/en-us/entra/workload-id/workload-identity-federation-create-trust-user-assigned-managed-identity#environment-example), and GitHub documents how environments determine the OIDC [`sub` claim](https://docs.github.com/en/actions/reference/security/oidc#example-subject-claims).

### GitHub values

Add these as Actions environment secrets on `vscode-marketplace` (Microsoft recommends secrets even though the identifiers are not credentials):

| Name | Value |
|---|---|
| `AZURE_CLIENT_ID` | Managed identity `clientId` |
| `AZURE_TENANT_ID` | Directory/tenant ID |
| `AZURE_SUBSCRIPTION_ID` | Azure subscription ID |

There is no password, client secret, certificate, or Marketplace token. Microsoft documents these [three GitHub values and the `azure/login` step](https://learn.microsoft.com/en-us/azure/developer/github/connect-from-azure-openid-connect#set-up-azure-login-action-with-openid-connect-in-github-actions-workflows).

The workflow authentication and publication steps are:

```yaml
- uses: azure/login@v3
  with:
    client-id: ${{ secrets.AZURE_CLIENT_ID }}
    tenant-id: ${{ secrets.AZURE_TENANT_ID }}
    subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

- run: npx --yes @vscode/vsce@3.9.2 publish --azure-credential
  working-directory: vscode
```

`azure/login` establishes an Azure CLI session; VSCE 3.9.2's `--azure-credential` uses that session to request the Azure DevOps resource token.

### Marketplace membership

After the federated login works, run this once in that GitHub Actions job:

```sh
az rest \
  --url 'https://app.vssps.visualstudio.com/_apis/profile/profiles/me' \
  --resource '499b84ac-1321-427f-aa17-267ca6975798' \
  --query id \
  --output tsv
```

Copy the returned profile ID. In [Manage Publishers & Extensions](https://marketplace.visualstudio.com/manage/publishers/), open publisher `andrebrait`, add that ID as a member, and assign **Contributor**. These are the identity lookup and membership steps in Microsoft's [Marketplace publishing guide](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#secure-automated-publishing-to-visual-studio-marketplace).

## Existing Marketplace token

VSCE accepts a PAT through `--pat` or the `VSCE_PAT` environment variable. Invariant instead passes the same kind of token to the publishing action as `VS_MARKETPLACE_TOKEN`, following the action's documented input name. Microsoft's current [GitHub Actions example](https://code.visualstudio.com/api/working-with-extensions/continuous-integration#github-actions-automated-publishing) names the direct-VSCE secret `VSCE_PAT`.

The Marketplace-specific PAT requirements are:

- Organization: **All accessible organizations**
- Scope: **Marketplace > Manage**
- GitHub secret: `VSCE_PAT`
- Expiration: chosen by the user, subject to a maximum of one year and any stricter tenant policy

Those requirements are in Microsoft's [Marketplace PAT instructions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#get-a-personal-access-token); the general [PAT documentation](https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate) covers expiration and rotation.

This is not a viable new long-term setup: the required all-organizations token is a global PAT, new global PATs can no longer be created, and existing ones stop working no later than December 1, 2026.

## Native Marketplace OIDC status

VSCE's `main` branch contains `publish --oidc` and describes a Marketplace trusted-publishing policy. The implementation first landed in [PR 1291](https://github.com/microsoft/vscode-vsce/pull/1291), then Microsoft merged [PR 1297](https://github.com/microsoft/vscode-vsce/pull/1297), titled “Hide unannounced OIDC option from help.” The option remains hidden in the `3.9.3` prerelease line and is absent from stable 3.9.2.

Until Microsoft announces the feature, ships it in a stable VSCE release, and exposes the corresponding Marketplace policy controls, it should not be used for the release workflow.
