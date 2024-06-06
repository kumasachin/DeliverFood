const casting = {
    date: {
      serialize: function (dateObj) {
        return dateObj.toISOString();
      },
      deserialize: function (dateText) {
        return new Date(dateText);
      },
    },
    bool: {
      serialize: function (bool) {
        return bool ? 1 : 0;
      },
      deserialize: function (int) {
        return !!int;
      },
    },
  };
  
  function castCoordinates(modelField, dbLatField, dbLngField) {
    return {
      serialize: function (data) {
        if (!data[modelField]) {
          data[modelField] = { lat: '', lng: '' };
        }
  
        data[dbLatField] = data[modelField].lat;
        data[dbLngField] = data[modelField].lng;
        delete data[modelField];
      },
      deserialize: function (data) {
        data[modelField] = { lat: data[dbLatField], lng: data[dbLngField] };
        delete data[dbLatField];
        delete data[dbLngField];
      },
    };
  }
  
  const customCasters = {
    coordinates: castCoordinates,
  };
  
  function createCastSchema(config) {
    const customCasters = [];
  
    let schema = {
      serialize: function (data) {
        const copy = { ...data };
        for (let field in config) {
          if (copy[field] !== undefined) {
            copy[field] = config[field].serialize(copy[field]);
          }
        }
        for (const customCaster of customCasters) {
          customCaster.serialize(copy);
        }
        return copy;
      },
      deserialize: function (data) {
        const copy = { ...data };
        for (let field in config) {
          if (copy[field] !== undefined) {
            copy[field] = config[field].deserialize(copy[field]);
          }
        }
        for (const customCaster of customCasters) {
          customCaster.deserialize(copy);
        }
        return copy;
      },
      addCustomCaster: function (caster) {
        customCasters.push(caster);
        return schema;
      },
    };
  
    return schema;
  }
  
  module.exports = {
    casting,
    customCasters,
    createCastSchema,
  };
  