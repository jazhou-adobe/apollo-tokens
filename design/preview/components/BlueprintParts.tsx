import { SwitchDemo } from './CoreDemos';
import { Icon } from './Icon';

/** Settings blueprint: Agent tokens, exposure, notifications. */
export function CoreSettingsNav() {
  return (
    <div className="hh-command">
      <div className="hh-command-grid">
      <nav className="hh-side-nav hh-panel" aria-label="Settings sections">
        <a href="#settings-tokens" aria-current="page">
          <Icon name="lock" /> Agent tokens
        </a>
        <a href="#settings-exposure">
          <Icon name="signal" /> Exposure
        </a>
        <a href="#settings-notify">
          <Icon name="alert" /> Notifications
        </a>
      </nav>
      <div className="hh-command-panel">
        <div id="settings-tokens" className="hh-card hh-stack">
          <h4 className="hh-heading-md">Agent tokens</h4>
          <div className="hh-table-wrap" tabIndex={0} role="region" aria-label="Agent tokens">
            <table className="hh-table" data-density="compact">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Last used</th>
                  <th scope="col">
                    <span className="hh-visually-hidden">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="hh-mono">devbox</td>
                  <td data-numeric>09:41</td>
                  <td>
                    <button type="button" className="hh-button" data-variant="destructive" data-size="sm">
                      Revoke
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="hh-mono">nas</td>
                  <td data-numeric>02:04</td>
                  <td>
                    <button type="button" className="hh-button" data-variant="destructive" data-size="sm">
                      Revoke
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <button type="button" className="hh-button">
            New token
          </button>
        </div>
        <fieldset id="settings-exposure" className="hh-card hh-field">
          <legend className="hh-heading-md">Exposure</legend>
          <label className="hh-radio">
            <input type="radio" name="bp-exposure" defaultChecked /> This machine only (127.0.0.1)
          </label>
          <label className="hh-radio">
            <input type="radio" name="bp-exposure" /> Tailnet (devices you own)
          </label>
          <p className="hh-hint">The Command Center is never exposed to the public internet.</p>
        </fieldset>
        <div id="settings-notify" className="hh-card hh-stack">
          <h4 className="hh-heading-md">Notifications</h4>
          <SwitchDemo label="New Round" initial />
          <SwitchDemo label="Policy fires in 1 minute" initial />
          <SwitchDemo label="Agent disconnected" />
        </div>
      </div>
      </div>
    </div>
  );
}
