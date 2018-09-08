const { random, highestTick, deepCopy } = require('../utils');

const createTick = (dataStore, tick) => {
  const _highestTick = highestTick(dataStore.ticks);

  let ticksToCreate = 1;

  if (tick !== undefined && tick > _highestTick) {
    ticksToCreate = tick - _highestTick;
  }

  if (tick !== undefined && tick <= _highestTick) {
    throw new Error('Tick already exists and cannot be created.');
  }

  let increment = 1;
  return new Array(ticksToCreate).fill({}).map(() => {
    // Current tick id.
    const id = (dataStore.ticks.length === 0) ? 0 : _highestTick + increment;
    increment = increment + 1;

    let state = { id };

    // Copy the previous tick state if the current tick isn't 0.
    if (id > 0) {
      // Deep copy, so updating properties in "state" will not affect the previous tick.
      state = deepCopy(dataStore.ticks[id - 1]);
      state.id = id;
    }

    // All existing fishes should swim to a random point near them.
    state.fishes = state.fishes.map((_fish) => {
      const location = [
        _fish.location[0] + random(4) - 2,
        _fish.location[1] + random(4) - 2,
        _fish.location[2] + random(4) - 2,
      ];

      if (location[0] > dataStore.aquarium.dimensions / 2 || location[0] < -(dataStore.aquarium.dimensions / 2)) {
        location[0] = _fish.location[0];
      }

      if (location[1] > dataStore.aquarium.dimensions / 2 || location[1] < -(dataStore.aquarium.dimensions / 2)) {
        location[1] = _fish.location[1];
      }

      if (location[2] > dataStore.aquarium.dimensions / 2 || location[2] < -(dataStore.aquarium.dimensions / 2)) {
        location[2] = _fish.location[2];
      }

      _fish.location = location;

      return _fish;
    });

    // Is a fish spawned in the current tick?
    const fish = dataStore.fishes.filter(fish => fish.tick === id);
    // If a fish is found, add it to the list of existing fishes.
    if (fish && fish.length > 0) {
      state.fishes.push(deepCopy(fish[0]));
    }

    // Commit new tick state to the data store.
    dataStore.ticks[id] = deepCopy(state);

    return state;
  });
};

module.exports = {
  createTick
};
