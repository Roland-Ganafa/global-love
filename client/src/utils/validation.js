import * as Yup from 'yup';

export const loginSchema = Yup.object().shape({
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    password: Yup.string()
        .required('Password is required')
        .min(6, 'Password must be at least 6 characters')
});

export const registerSchema = Yup.object().shape({
    name: Yup.string()
        .required('Name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must be less than 50 characters'),
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    password: Yup.string()
        .required('Password is required')
        .min(6, 'Password must be at least 6 characters'),
    confirmPassword: Yup.string()
        .required('Please confirm your password')
        .oneOf([Yup.ref('password')], 'Passwords must match'),
    age: Yup.number()
        .required('Age is required')
        .min(18, 'You must be at least 18 years old')
        .max(120, 'Please enter a valid age')
});

export const profileUpdateSchema = Yup.object().shape({
    name: Yup.string()
        .required('Name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must be less than 50 characters')
        .trim(),
    age: Yup.number()
        .required('Age is required')
        .min(18, 'You must be at least 18 years old')
        .max(120, 'Please enter a valid age')
        .integer('Age must be a whole number'),
    gender: Yup.string()
        .required('Gender is required')
        .oneOf(['male', 'female', 'other'], 'Please select a valid gender'),
    bio: Yup.string()
        .max(500, 'Bio must be less than 500 characters')
        .nullable(),
    location: Yup.object().shape({
        country: Yup.string()
            .required('Country is required'),
        city: Yup.string()
            .required('City is required'),
        address: Yup.string().nullable(),
        coordinates: Yup.array().of(Yup.number()).nullable()
    }),
    interests: Yup.array()
        .of(Yup.string().trim())
        .nullable(),
    relationshipGoals: Yup.string()
        .oneOf(['casual', 'serious', 'marriage', 'friendship'], 'Please select a valid relationship goal')
        .nullable(),
    partnerPreferences: Yup.object().shape({
        ageRange: Yup.object().shape({
            min: Yup.number()
                .min(18, 'Minimum age must be at least 18')
                .max(Yup.ref('max'), 'Minimum age cannot be greater than maximum age')
                .required('Minimum age is required'),
            max: Yup.number()
                .min(Yup.ref('min'), 'Maximum age must be greater than minimum age')
                .max(120, 'Maximum age cannot exceed 120')
                .required('Maximum age is required')
        }),
        gender: Yup.string()
            .oneOf(['male', 'female', 'other', 'any'], 'Please select a valid gender preference')
            .nullable(),
        maxDistance: Yup.number()
            .min(0, 'Distance cannot be negative')
            .max(20000, 'Maximum distance cannot exceed 20000 km')
            .nullable()
    }).nullable()
});

export const contentSchema = Yup.object().shape({
    title: Yup.string()
        .required('Title is required')
        .max(100, 'Title must be less than 100 characters'),
    description: Yup.string()
        .max(500, 'Description must be less than 500 characters'),
    tags: Yup.array()
        .of(Yup.string())
        .max(5, 'You can have at most 5 tags')
});

export const messageSchema = Yup.object().shape({
    content: Yup
        .string()
        .required('Message cannot be empty')
        .max(1000, 'Message too long')
});

export const commentSchema = Yup.object().shape({
    text: Yup
        .string()
        .required('Comment cannot be empty')
        .max(200, 'Comment too long')
});
