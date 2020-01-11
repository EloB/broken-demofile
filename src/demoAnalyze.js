const demofile = require('demofile');

const fires = {
  'models/Weapons/w_eq_incendiarygrenade_dropped.mdl': 'Fire',
  'models/Weapons/w_eq_molotov_dropped.mdl': 'Fire',
};

const grenadeMapper = {
  hegrenade_detonate: 'Damage',
  flashbang_detonate: 'Flash',
  smokegrenade_detonate: 'Smoke',
  decoy_started: 'Decoy'
};

const asyncEvent = (target, event) => new Promise((resolve) => {
  const handle = (e) => {
    target.off(event, handle);
    resolve(e);
  };

  target.on(event, handle);
});

const demoAnalyze = async (from, buffer) => {
  const grenades = {};
  const demoFile = new demofile.DemoFile();

  let triggered = 0;
  const log = (...args) => {
    triggered++;
    // console.log(from, ...args);
  };

  demoFile.on('start', () => log(demoFile.header));
  demoFile.on('end', () => log(demoFile.header));

  demoFile.entities.on('postcreate', (e) => {
    log(e);
    if (!('DT_BaseCSGrenadeProjectile' in e.entity.props)) return;
    grenades[e.entity.handle] = {
      type: 'Fire',
      startTick: demoFile.currentTick,
      coordinates: [e.entity.position],
    };
  });

  demoFile.entities.on('beforeremove', (e) => {
    log(e);
    if (!('DT_BaseCSGrenadeProjectile' in e.entity.props)) return;
    if (fires[e.entity.modelName]) {
      const grenade = grenades[e.entity.handle];
      grenade.stopTick = demoFile.currentTick;
      grenade.coordinates.push(e.entity.position);
    }
  });

  demoFile.entities.on('change', (e) => {
    log(e);
    if (e.varName !== 'm_nBounces') return;
    grenades[e.entity.handle].coordinates.push(e.entity.position);
  });

  Object.keys(grenadeMapper).forEach((eventName) => {
    demoFile.gameEvents.on(eventName, (e) => {
      log(e);
      try {
        const entity = demoFile.entities.entities[e.entityid];
        const grenade = grenades[entity.handle];
        grenade.type = grenadeMapper[eventName];
        grenade.stopTick = demoFile.currentTick;
        grenade.coordinates.push(entity.position);
      } catch(error) {}
    });
  });

  demoFile.parse(buffer);

  await asyncEvent(demoFile, 'end');

  console.log(from, triggered);

  return {
    map: demoFile.header.mapName,
    grenades: Object.values(grenades),
  };
};

module.exports = demoAnalyze;
