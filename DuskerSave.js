class DuskerSave {
    constructor(universedata) {
        const lines = universedata.split('\n');

        this.types = {
            GSTATE: DuskerGState,
            PLAYER: DuskerPlayer,
            OBJ: DuskerObj,
            SLOT: DuskerSlot,
            GXE: DuskerGXE,
            GX: DuskerGX,
            OBJN: DuskerObjN,
            DRONE: DuskerDrone,
            INVITMD: DuskerItemDrone,
            INVITMS: DuskerItemShip
        };

        const parsedTypes = lines.reduce((parsedType, line) => {
            if (!line.length) return parsedType;
            if (line.charAt(0) !== '+') {
                const [key, val] = line.split('=');
                parsedType.SETTINGS[key] = _configValParser(val);
            } else {
                const [m, type, id, val] = line.match(/\+([A-Z_]+?)(?:\||_(\d+)\|)(.*)/);
                if (!parsedType[type]) parsedType.unknown.push(line);
                else parsedType[type].push(new this.types[type](id, val));
            }
            return parsedType;
        }, [{SETTINGS: {}}]
            .concat(Object.keys(this.types).map(type => ({[type]: []})))
            .concat([{unknown: []}])
            .reduce((o, type) => Object.assign(o, type), {})
        );
        Object.assign(this, parsedTypes);
    }
    toString() {
        const outputOrder = [
            'SETTINGS',
            'GSTATE',
            'unknown',
            'PLAYER',
            'OBJ',
            'SLOT',
            'GXE',
            'GX',
            'OBJN',
            'DRONE',
            'INVITMD',
            'INVITMS'
        ];

        return outputOrder.map(type => {
            if (Array.isArray(this[type])) {
                return this[type]
                    .map(item => item.toString())
                    .join('\n');
            }
            return Object.keys(this[type])
                .map(key => key + '=' + _configValSerialiser(this[type][key]))
                .join('\n');
        }).join('\n').split('\n').filter(Boolean).join('\n') + '\n';
    }
}

class DuskerSaveLine {
    constructor(name, id) {
        this.prefix = '+';
        this.name = name || '';
        this.id = id || '';
        this.config = {};
    }
    get fullName() {
        return this.name + (this.id ? '_' + this.id : '');
    }
    toString() {
        let str = (this.prefix || '')
            + (this.name)
            + (this.id ? '_' + this.id : '')
            + ('|');

        return str + _configSerialiser(this.config);
    }
    owner(root) {
        const ownerId = this.config.P;
        const types = Object.keys(root.types);
        return types.reduce(
            (o, type) => Object.assign(
                o,
                {[type]: root[type].filter(obj => obj.fullName === ownerId)}
            ),
            {}
        );
    }
    owns(root) {
        const id = this.fullName;
        const types = Object.keys(root.types);
        return types.reduce(
            (o, type) => Object.assign(
                o,
                {[type]: root[type].filter(obj => obj.config.P === id)}
            ),
            {}
        );
    }
}

class DuskerGState extends DuskerSaveLine {
    constructor(id, val) {
        super('GSTATE');
        Object.assign(this.config, _configListParser(val));
    }
}

class DuskerPlayer extends DuskerSaveLine {
    constructor(id, val) {
        super('PLAYER');
        Object.assign(this.config, _configListParser(val));
    }
    ship(root) {
        const shipId = this.config.SHIP_ID;
        return root.OBJ.find(obj => 'OBJ_' + obj.id === shipId);
    }
}

class DuskerObj extends DuskerSaveLine {
    constructor(id, val) {
        super('OBJ', id);
        Object.assign(this.config, _configListParser(val));
    }
    slots(root) {
        return root.SLOT.filter(slot => slot.conflig.P === this.id);
    }
}

class DuskerSlot extends DuskerSaveLine {
    constructor(id, val) {
        super('SLOT', id);
        Object.assign(this.config, _configListParser(val));
    }
}

class DuskerGXE extends DuskerSaveLine {
    constructor(id, val) {
        super('GXE', id);
        Object.assign(this.config, _configListParser(val));
    }
}

class DuskerGX extends DuskerSaveLine {
    constructor(id, val) {
        super('GX', id);
        Object.assign(this.config, _configListParser(val));
    }
}

class DuskerObjN extends DuskerSaveLine {
    constructor(id, val) {
        super('OBJN', id);
        Object.assign(this.config, _configListParser(val));
    }
    toString() {
        return super.toString();
    }
}

class DuskerDrone extends DuskerSaveLine {
    constructor(id, val) {
        super('DRONE', id);
        Object.assign(this.config, _configListParser(val));
    }
}

class DuskerItemDrone extends DuskerSaveLine {
    constructor(id, val) {
        super('INVITMD', id);
        Object.assign(this.config, _configListParser(val));
    }
}

class DuskerItemShip extends DuskerSaveLine {
    constructor(id, val) {
        super('INVITMS', id);
        Object.assign(this.config, _configListParser(val));
    }
}

function _configListParser(list) {
    return list.split(':').reduce((parsed, setting) => {
        const [key, val] = setting.split('=');
        parsed[key] = _configValParser(val);
        return parsed;
    }, {});
}

function _configValParser(val) {
    if (/^\d+(?:\.\d+)?$/.test(val)) return +val;
    if (val === 'True') return true;
    if (val === 'False') return false;
    return val;
}

function _configValSerialiser(val) {
    const type = typeof val;
    switch (type) {
        case 'number': return val.toString();
        case 'boolean': return val ? 'True' : 'False';
        default: return val;
    }
}

function _configSerialiser(config) {
    return Object.keys(config)
        .map(key => key + '=' + _configValSerialiser(config[key]))
        .join(':');
}

// OBJN get a COPY_OBJN, difference is only VISITED=False on copy if VISITED=True
