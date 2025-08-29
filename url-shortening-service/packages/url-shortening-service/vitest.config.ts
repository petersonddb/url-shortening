import {defineConfig} from 'vitest/config';
import dotenv from 'dotenv';

export default defineConfig(() => {
    dotenv.config({path: ".env.test"});

    return {
        test: {
            environment: "node"
        }
    }
});
