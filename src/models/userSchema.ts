import mongoose, {Document, Schema, MongooseError} from "mongoose";
import bcrypt from "bcrypt";

export interface Users extends Document {
    username: string;
    password: string;
    email: string;
    // role: string;
    comparePassword: comparePasswordFunction; 
}
type comparePasswordFunction = (candidatePassword: string, cb: (err: any, isMatch: any) => void) => void;


const userSchema = new Schema<Users>({
    username:{
        type: String,
        required: true,
        unique: true
    }, 

    password:{
        type: String,
        required: true
    },

    email:{
        type: String,
        required: true,
        unique: true
    },

},
{ timestamps: true },
)
/**
 * Password hash middleware.
 */
//hash password before saving

userSchema.pre("save", function save(next) {
    const user = this as Users;
    if (!user.isModified("password")) { return next(); }
    bcrypt.genSalt(10, (err, salt) => {
        if (err) { return next(err); }
        bcrypt.hash(user.password, salt, (err: mongoose.Error | undefined, hash) => {
            if (err) { return next(err); }
            user.password = hash;
            next();
        });
    });
});

const comparePassword: comparePasswordFunction = function ( this: Users, candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, (err: mongoose.Error | undefined, isMatch: boolean) => {
        cb(err, isMatch);
    });
};

userSchema.methods.comparePassword = comparePassword;


 export const User = mongoose.model<Users>("Auth", userSchema);
;