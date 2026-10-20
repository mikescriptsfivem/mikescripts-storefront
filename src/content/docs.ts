/**
 * Installation guides shown at /docs. Written from the buyer README files shipped with each resource.
 * Text supports [links](https://…) and `inline code`. Add a guide by appending an object to `guides`.
 */
export type DocBlock =
  | { type: 'p'; text: string }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'code'; code: string; label?: string }
  | { type: 'table'; head: string[]; rows: string[][] }

export interface DocSection {
  heading: string
  blocks: DocBlock[]
}

export interface DocGuide {
  id: string
  title: string
  summary: string
  /** Product key from src/config/products.ts, used to link the guide and the product page. */
  productKey?: string
  sections: DocSection[]
}

export const guides: DocGuide[] = [
  {
    id: 'getting-started',
    title: 'Buying and downloading',
    summary: 'How purchases, delivery through your Cfx.re account and updates work.',
    sections: [
      {
        heading: 'Purchasing',
        blocks: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Add a script to your basket on this website.',
              'Log in with your Cfx.re account when Tebex asks. The script is delivered to this account, so use the one that owns your server key.',
              'Continue to checkout. Payment happens on Tebex’s secure checkout page; card details are never entered on this website.',
            ],
          },
        ],
      },
      {
        heading: 'Downloading your script',
        blocks: [
          {
            type: 'p',
            text: 'After payment, the resource is granted to your Cfx.re account. Sign in to the [Cfx.re Portal](https://portal.cfx.re), open your granted assets and download the script. Tebex also emails you a receipt.',
          },
          {
            type: 'p',
            text: 'Escrow-protected resources only start on servers whose license key belongs to the same Cfx.re account.',
          },
        ],
      },
      {
        heading: 'Installing a resource',
        blocks: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Unzip the download and place the resource folder in your server’s `resources` folder. Keep the folder name unchanged.',
              'Add an `ensure` line for the resource to `server.cfg`, after its dependencies.',
              'Restart the server and check the server console and the F8 console for errors.',
            ],
          },
          { type: 'p', text: 'Each script’s guide below lists its exact folder names, dependencies and commands.' },
        ],
      },
      {
        heading: 'Updates',
        blocks: [
          {
            type: 'p',
            text: 'Updates are published to the same Cfx.re asset. Download the new version from the Cfx.re Portal, back up any configuration files you changed, then replace the resource folder.',
          },
        ],
      },
    ],
  },
  {
    id: 'ms-flightsim',
    title: 'All-In-One Flight Simulator',
    summary: 'Aviation career for ESX Legacy, QBox and QBCore: requirements, setup and editable files.',
    productKey: 'ms-flightsim',
    sections: [
      {
        heading: 'Requirements',
        blocks: [
          { type: 'list', items: ['`oxmysql`', '`ox_lib`', '`ox_inventory`', 'One of `qbx_core`, `qb-core` or `es_extended`'] },
          { type: 'p', text: 'Optional, detected automatically: `ox_target`, `PolyZone`, `qbx_vehiclekeys` / `qb-vehiclekeys`.' },
        ],
      },
      {
        heading: 'Installation',
        blocks: [
          { type: 'p', text: 'Takes about 5–10 minutes. The full step-by-step guide is in the `README.md` bundled with the resource.' },
          {
            type: 'list',
            ordered: true,
            items: [
              'Drop the resource folder into your `resources` folder.',
              'Add an `ensure` line for it to `server.cfg`, after your framework.',
              'Import the SQL file once. Later updates migrate the database automatically on resource start.',
              'Add the `pilot` job and the `pilot_tablet` item to your framework.',
              'Restart the server.',
            ],
          },
        ],
      },
      {
        heading: 'Included resources',
        blocks: [
          {
            type: 'p',
            text: 'The package also includes the [MS-100 walk-in airliner](/docs/ms100) and the [MS-E ground support fleet](/docs/mse-fleet). Both need OneSync. Start them before the flight simulator:',
          },
          { type: 'code', label: 'server.cfg', code: 'ensure MS_FlightSim_MSE\nensure ms100\nensure MS_FlightSim' },
          { type: 'p', text: 'Keep the folder names `ms100` and `MS_FlightSim_MSE`: the flight simulator finds them by name.' },
        ],
      },
      {
        heading: 'What you can edit',
        blocks: [
          {
            type: 'list',
            items: [
              '`config.lua`: aircraft list, prices, rent terms, locations, jobs, fees and paint presets',
              '`bridge/client.lua` and `bridge/server.lua`: the framework bridge',
              '`locales/*.lua`: translations (English and French included)',
              '`html/hud-config.js`: HUD colours, panel toggles, sound mappings and volume',
              'Replaceable aircraft, tablet, cockpit, airport, map, landing-zone and sound assets',
            ],
          },
          { type: 'p', text: 'Core flight logic, server-authoritative code and avionics maths are escrow-protected.' },
        ],
      },
      {
        heading: 'Commands',
        blocks: [
          {
            type: 'table',
            head: ['Command', 'What it does'],
            rows: [
              ['`/pilottablet`', 'Open the pilot tablet: flight radar, flight plans, logbook, insurance and job entry'],
              ['`/adminps`', 'In-game admin panel (ACE-group gated): players, strikes, zones, jobs and aircraft'],
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ms8000',
    title: 'MS8000',
    summary: 'Ultra-long-range luxury business jet. Standalone, runs on ms_aircraft_core.',
    productKey: 'ms8000',
    sections: [
      {
        heading: 'Installation',
        blocks: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Put both folders in your `resources` folder: `ms_aircraft_core` and `ms8000`.',
              'Start the core first in `server.cfg`.',
              'Give admins the test ace for `/ms8000spawn`, `/ms8000livery`, `/ms8000service` and `/ms8000remove`.',
            ],
          },
          {
            type: 'code',
            label: 'server.cfg',
            code: 'ensure ms_aircraft_core\nensure ms8000\nadd_ace group.admin ms8000.test allow',
          },
          { type: 'p', text: 'Spawn the model `ms8000` with any garage or vehicle spawner. `/ms8000help` lists the player commands.' },
        ],
      },
      {
        heading: 'Configuration',
        blocks: [
          {
            type: 'p',
            text: 'Everything you can change is in `ms8000/config.lua`: lighting modes, flight hold, doors, ranges and permissions. Keep `debug = false` on a live server; debug mode turns on developer tools such as seat warps and the AI test flight.',
          },
        ],
      },
      {
        heading: 'Keys and commands',
        blocks: [
          {
            type: 'table',
            head: ['Key', 'Action'],
            rows: [
              ['E', 'Open or close doors'],
              ['F', 'Sit or stand'],
              ['G', 'Landing gear'],
              ['H', 'Cycle taxi and landing lights'],
            ],
          },
          {
            type: 'p',
            text: 'Player commands: `/ms8000help`, `/ms8000door`, `/ms8000cabin`, `/ms8000beam`, `/ms8000lights`, `/ms8000gear`. Optional: `ox_target` opens the doors from the target menu, and MS_FlightSim keeps the landing lights in sync.',
          },
        ],
      },
    ],
  },
  {
    id: 'ms-hwywrk',
    title: 'MS_HwyWrk Heavy Rotator Wrecker',
    summary: 'Heavy rotator tow truck. OneSync, no framework required.',
    productKey: 'ms-hwywrk',
    sections: [
      {
        heading: 'Requirements',
        blocks: [
          { type: 'list', items: ['A FiveM server with OneSync', 'No framework required. ESX, QBCore or Qbox are only needed for job permissions.'] },
        ],
      },
      {
        heading: 'Installation',
        blocks: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Put the `MS_HwyWrk` folder in your `resources` folder.',
              'Add `ensure MS_HwyWrk` to your `server.cfg`.',
              'Restart the server.',
              'Spawn `ms_hwywrk` from your garage or admin menu (for example `/car ms_hwywrk` on ESX).',
            ],
          },
          { type: 'code', label: 'server.cfg', code: 'ensure MS_HwyWrk' },
        ],
      },
      {
        heading: 'Controls',
        blocks: [
          {
            type: 'table',
            head: ['Key', 'Action'],
            rows: [
              ['G', 'Use a rear control panel (on foot) or the cab switches (driver)'],
              ['Q', 'Amber lightbar and beacons on / off'],
              ['E (on foot)', 'Take / attach / drop a winch hook'],
              ['E (driver)', 'Air horn'],
              ['Left click (hold)', 'Move a lever'],
              ['C', 'Wide / close panel view'],
              ['Backspace', 'Exit the panel'],
            ],
          },
          { type: 'p', text: 'Players can change G, Q and E in their FiveM key bindings.' },
        ],
      },
      {
        heading: 'Customisation',
        blocks: [
          {
            type: 'p',
            text: '`config.lua` and the language file stay open: keys, speeds, cable lengths, lights, sounds and permissions. English and French are included. The truck ships in plain paint with a livery layer and a UV guide for your own designs.',
          },
        ],
      },
    ],
  },
  {
    id: 'ms-helipol',
    title: 'MS_Helipol Police Helicopter System',
    summary: 'Police helicopter camera, target lock, spotlight and rappel for ESX, QBCore, Qbox or standalone.',
    productKey: 'ms-helipol',
    sections: [
      {
        heading: 'Compatibility',
        blocks: [
          {
            type: 'table',
            head: ['Framework', 'Supported'],
            rows: [
              ['ESX Legacy 1.10+', 'Yes'],
              ['QBCore', 'Yes'],
              ['Qbox', 'Yes'],
              ['Standalone', 'Yes (ace permission)'],
            ],
          },
          {
            type: 'p',
            text: 'The framework is detected automatically. Optional: `ox_lib` for notifications and keymaps, and OneSync Infinity (recommended for the spotlight broadcast).',
          },
        ],
      },
      {
        heading: 'Installation',
        blocks: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Drop `MS_Helipol` into your `resources` folder.',
              'Add `ensure MS_Helipol` to `server.cfg`.',
              'Run `refresh; ensure MS_Helipol` in the live console, or restart the server.',
            ],
          },
          { type: 'code', label: 'server.cfg', code: 'ensure MS_Helipol' },
        ],
      },
      {
        heading: 'Default controls',
        blocks: [
          {
            type: 'table',
            head: ['Key', 'Action'],
            rows: [
              ['Hold E', 'Open / close camera'],
              ['Tap E', 'Cycle vision (Normal → Night vision → Thermal)'],
              ['Mouse wheel', 'Zoom in / out'],
              ['Left click', 'Lock target (vehicle or ped)'],
              ['Right click', 'Release lock'],
              ['L', 'Toggle spotlight'],
              ['Q', 'Rappel (rear seats)'],
            ],
          },
          { type: 'p', text: 'All keys are rebindable by each player from the FiveM pause menu.' },
        ],
      },
      {
        heading: 'Configuration',
        blocks: [
          { type: 'p', text: 'Every value in `config.lua` is commented inline. The main settings:' },
          {
            type: 'code',
            label: 'config.lua',
            code: "Config.Framework = 'auto'   -- esx | qb | qbox | standalone | auto\nConfig.Jobs = { ['police'] = true, ['sheriff'] = true, ['state'] = true, ['swat'] = true }\nConfig.MinGrade = { Camera = 0, Rappel = 1, Spotlight = 0 }\nConfig.Seats = { Camera = { 0, 1, 2 }, Spotlight = { -1, 0 }, Rappel = { 1, 2 } }",
          },
          { type: 'p', text: 'Licence: single server (per Cfx.re key).' },
        ],
      },
    ],
  },
  {
    id: 'ms-fire',
    title: 'MS_Fire Advanced Fire System',
    summary: 'Fire alarm panels, strobes, sprinklers and inspections for ESX, QBCore and Qbox.',
    productKey: 'ms-fire',
    sections: [
      {
        heading: 'Dependencies',
        blocks: [
          { type: 'list', items: ['`oxmysql`', '`ox_target`', 'One of `es_extended`, `qb-core` or `qbx_core`'] },
          { type: 'p', text: 'Recommended: `ox_inventory` (detected automatically).' },
        ],
      },
      {
        heading: 'Installation',
        blocks: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Drop `MS_Fire` into your `resources` folder.',
              'Add `ensure oxmysql` and `ensure ox_target` before `ensure MS_Fire` in `server.cfg`.',
              'Run `sql/install.sql` (it also auto-migrates on first start). For ESX/QB inventories, paste the items snippet manually.',
              'Set your firefighter job names in `config.lua`.',
              'In game, run `/firesetup`: draw a zone, place a panel, detector, pull station and sprinkler, then wire the zone.',
            ],
          },
          { type: 'code', label: 'server.cfg', code: 'ensure oxmysql\nensure ox_target\nensure MS_Fire' },
        ],
      },
      {
        heading: 'Commands',
        blocks: [
          {
            type: 'table',
            head: ['Command', 'Permission', 'What it does'],
            rows: [
              ['`/firesetup`', 'Admin or top-rank firefighter', 'Open the device-placement UI'],
              ['`/firemenu`', 'Firefighter (or all, configurable)', 'Building overview with GPS and inspection due dates'],
              ['`/firewire`', 'Admin', 'Wire zones to panels'],
              ['`/firestop`', 'Admin', 'Emergency stop of fires'],
              ['`/firerefresh`', 'Anyone', 'Re-sync devices from the server'],
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ms-atc-tower',
    title: 'LSIA Air Traffic Control Tower',
    summary: 'Walk-in ATC tower MLO for Los Santos International. No dependencies.',
    productKey: 'ms-atc-tower',
    sections: [
      {
        heading: 'Installation',
        blocks: [
          {
            type: 'list',
            ordered: true,
            items: ['Put the `ms_atc` folder in your `resources` folder.', 'Add `ensure ms_atc` to your `server.cfg`.', 'Restart the server.'],
          },
          { type: 'code', label: 'server.cfg', code: 'ensure ms_atc' },
          {
            type: 'p',
            text: 'The lift between the lobby and the upper level is built in: press E inside the car. Its two stops are set in `config.lua`, which stays open.',
          },
        ],
      },
      {
        heading: 'Notes',
        blocks: [
          {
            type: 'list',
            items: [
              'Furniture and fixtures are base-game props, so there are no dependencies.',
              'The ATC radar console shown on the desks in the previews is part of MS_FlightSim, sold separately. The tower ships with empty desks.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ms-balloon',
    title: 'Hot Air Balloon (ms_balloon)',
    summary: 'Free, standalone hot air balloon.',
    productKey: 'ms-balloon',
    sections: [
      {
        heading: 'Installation',
        blocks: [
          { type: 'p', text: 'Drop `ms_balloon` into your `resources` folder and add `ensure ms_balloon` to your `server.cfg`.' },
          { type: 'code', label: 'server.cfg', code: 'ensure ms_balloon' },
        ],
      },
    ],
  },
  {
    id: 'ms100',
    title: 'MS-100',
    summary: 'Walk-in airliner included with All-In-One Flight Simulator: install, spawning and commands.',
    productKey: 'ms-flightsim',
    sections: [
      {
        heading: 'Installation',
        blocks: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Put the `ms100` folder in your `resources` folder. Keep the folder name `ms100`.',
              'Add `ensure ms100` to `server.cfg`. If you use MS_FlightSim, ensure `ms100` before it.',
              'OneSync must be enabled.',
              'Admin commands (spawn, remove, service) need the ACE line below.',
            ],
          },
          { type: 'code', label: 'server.cfg', code: 'ensure ms100\nadd_ace group.admin ms100.test allow' },
        ],
      },
      {
        heading: 'Spawning',
        blocks: [
          {
            type: 'p',
            text: 'Use `/ms100spawn` (admins) or any vehicle spawner or garage. Models: `ms100` (MikeScripts livery), `ms100_flyus`, `ms100_adios`, `ms100_flylo` and `ms100_cluck`.',
          },
        ],
      },
      {
        heading: 'Commands',
        blocks: [
          {
            type: 'table',
            head: ['Command', 'What it does'],
            rows: [
              ['`/ms100help`', 'List the commands (F8 console)'],
              ['`/ms100pilot`, `/ms100copilot`', 'Take the pilot or co-pilot seat'],
              ['`/ms100seat 1-16`', 'Take a numbered seat'],
              ['`/ms100walk`, `/ms100exit`', 'Walk into the parked cabin or leave it'],
              ['`/ms100door l1 open|close`', 'Doors: l1, r1, l2, r2, cargo, cargoaft, exitl1, exitr1, exitl2, exitr2'],
              ['`/ms100gear up|down`', 'Landing gear'],
              ['`/ms100beam 0|1|2`', 'Landing lights off, low or high (pilot)'],
              ['`/ms100lights nav|beacon|landing|cabin on|off`', 'Aircraft lights'],
              ['`/ms100align stairs|belt|cater…`', 'Snap your MS-E service vehicle to the matching door'],
              ['`/ms100service …`', '(Admin) place an MS-E unit at the aircraft'],
              ['`/ms100remove`', '(Admin) remove the MS-100 you spawned'],
            ],
          },
          {
            type: 'p',
            text: 'Controls: F to sit or stand in the cabin, G for the landing gear. Edit `config.lua` (not encrypted) for streaming range, door timing, service reach, seat height and the livery list.',
          },
        ],
      },
    ],
  },
  {
    id: 'mse-fleet',
    title: 'MS-E Ground Support Fleet',
    summary: 'Eleven airport service units included with All-In-One Flight Simulator.',
    productKey: 'ms-flightsim',
    sections: [
      {
        heading: 'Installation',
        blocks: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Put the `MS_FlightSim_MSE` folder in your `resources` folder and keep the folder name: MS_FlightSim finds the fleet by it.',
              'Add `ensure MS_FlightSim_MSE` to `server.cfg`. If you use MS_FlightSim, ensure the fleet before it.',
              'OneSync must be enabled. Game build 2699 or newer is recommended for the electric drive sound.',
              'Do not also run the old separate `mse_*` / `egs_bl40_fivem_resource` resources or `mse_airport_lights`: they duplicate the same models.',
            ],
          },
          { type: 'code', label: 'server.cfg', code: 'ensure MS_FlightSim_MSE' },
          {
            type: 'p',
            text: 'No framework is required. If QBox, QBCore or ESX is running, the bridge detects it automatically for fuel and vehicle keys (`bridge/client.lua`, not encrypted).',
          },
        ],
      },
      {
        heading: 'Spawn models',
        blocks: [
          {
            type: 'table',
            head: ['Vehicle', 'Model'],
            rows: [
              ['TG-30 Tug', '`mse_tug`'],
              ['BL-40 Belt Loader', '`mse_belt`'],
              ['GP-90 Ground Power Unit', '`mse_gpu`'],
              ['HD-18 Fuel', '`mse_fuel`'],
              ['PW-15 Potable Water', '`mse_water`'],
              ['LS-12 Lavatory Service', '`mse_lav`'],
              ['CT-70 Catering Hi-Lift', '`mse_cater`'],
              ['PS-50 Passenger Stairs', '`mse_stairs`'],
              ['BC-25 Baggage Cart', '`mse_bagcart`'],
              ['PD-20 Pallet Dolly', '`mse_pallet`'],
              ['TB-20 Towbar', 'Fitted from the tug with U'],
            ],
          },
          {
            type: 'p',
            text: 'Optional spawn shortcuts (`/msetug`, `/msebelt` and so on) are off by default. Enable them with `Config.MSEFleet.spawnCommands = true` in `shared/mse_fleet.lua`; anyone can use them once enabled.',
          },
        ],
      },
      {
        heading: 'Controls',
        blocks: [
          {
            type: 'list',
            items: [
              'Tap E: amber warning lights. Hold E: horn.',
              'Tap H: headlights. Hold H: doors and secondary mechanisms (catering rear door, stairs bridge plate).',
              'Page Up / Page Down: lift, stairs flight, conveyor angle.',
              'U: fit or release the towbar (TG-30 only). Y: couple or release an aircraft.',
              'T: hitch or release the baggage cart or pallet dolly.',
            ],
          },
          {
            type: 'p',
            text: 'Commands: `/mselights on|off` (warning lights), `/egs_bl40_belt` (belt loader run up, run down, stop) and `/egs_bl40_cone` (place or stow the traffic cones). The towbar and both carts couple to the TG-30 tug only.',
          },
        ],
      },
    ],
  },
]
