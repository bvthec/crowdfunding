'use strict';
import { Sequelize, DataTypes } from 'sequelize';

export const sequelize = new Sequelize(
    process.env.DATABASE_NAME,
    process.env.DATABASE_USER,
    process.env.DATABASE_PASSWORD,
    {
        host: process.env.DATABASE_HOST,
        dialect: process.env.DATABASE_ENGINE,
        logging: false,
    }
);

export async function initDatabase() {
    console.log('Connecting to the database...');
    await sequelize.authenticate();
    console.log('Connection to the database was sucessfully established');

    console.log('Syncing with the database...')
    await sequelize.sync({alter: true});
    console.log('Synced with the database.');
}

export const UserType = sequelize.define(
    'userType',
    {
        id: {
            type: DataTypes.TINYINT,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },

        name: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    },
    {
        freezeTableName: true,
        timestamps: false,
    }
);

export const User = sequelize.define(
    'user',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },

        bi: {
            type: DataTypes.STRING(14),
            unique: 'bi',
            allowNull: false,
        },

        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        birthDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },

        address: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: 'email',
        },

        password: {
            type: DataTypes.TEXT,
            allowNull: false,
        }
    },
    {
        freezeTableName: true,
        timestamps: false,
    }
);

export const BankAccount = sequelize.define(
    'bankAccount',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },

        iban: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        bankName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        freezeTableName: true,
        timestamps: false,
    }
);

export const UserCard = sequelize.define(
    'userCard',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },

        number: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        // MM/AA
        // ignore the day value when using this field
        expires: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },

        // 3 digits code for verification
        cvc: {
            type: DataTypes.TINYINT,
            allowNull: false,
        },

        password: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    },
    {
        freezeTableName: true,
        timestamps: false,
    }
);

export const Project = sequelize.define(
    'projects',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },

        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },


        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        requiredFund: {
            type: DataTypes.DOUBLE,
            allowNull: false,
        },

        currentFund: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0.0,
        },
        
        created: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        
        dateLimit: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },

        mediaFolder: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    },
    {
        freezeTableName: true,
        timestamps: false,
    }
);

export const ProjectState = sequelize.define(
    'projectState',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },

        name: {
            type: DataTypes.STRING(15),
            allowNull: false,
        }
    },
    {
        freezeTableName: true,
        timestamps: false,
    }
);

export const History = sequelize.define(
    'history',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        
        fundAmount: {
            type: DataTypes.DOUBLE,
            allowNull: false,
        },
    },
    {
        freezeTableName: true,
        updatedAt: false,
    }
)

// relationships
UserType.hasMany(User, {
    foreignKey: {
        allowNull: false,
    }
});
User.belongsTo(UserType);

User.hasMany(BankAccount);
BankAccount.belongsTo(User, {
    foreignKey: {
        allowNull: false,
    }
});

User.hasMany(UserCard, {
    foreignKey: {
        allowNull: false,
    }
});
UserCard.belongsTo(User);

Project.belongsTo(User, {
    foreignKey: {
        allowNull: false,
    }
});

Project.belongsTo(BankAccount, {
    foreignKey: {
        allowNull: false,
    }            
});

ProjectState.hasMany(Project);
Project.belongsTo(ProjectState, {
    foreignKey: {
        allowNull: false,
    }
});

// History relation
User.hasMany(History);
UserCard.hasMany(History);
Project.hasMany(History);

History.belongsTo(User, {
    foreignKey: { allowNull: false}
});
History.belongsTo(UserCard, {
    foreignKey: { allowNull: false}
});
History.belongsTo(Project, {
    foreignKey: { allowNull: false}
});

export default {
    initDatabase,
    sequelize,
    UserType,
    User,
    BankAccount,
    UserCard,
    ProjectState,
    Project,
    History,
};