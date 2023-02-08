import { createClient } from 'urql'
import { challenge, getDefaultProfile } from "./queries";
import { authenticate } from './mutations'

const APIURL = "https://api-mumbai.lens.dev/playground";

export const urqlClient = createClient({
    url: APIURL,
})

export async function getChallenge(address) {
    const response = await urqlClient.query(challenge, { address }).toPromise();
    return response.data.challenge.text;
}

export async function Authenticate(address, signature) {
    const response = await urqlClient.mutation(authenticate, { address, signature }).toPromise();
    return response.data.authenticate;
}

export async function getProfile(address) {
    const response = await urqlClient.query(getDefaultProfile, { address }).toPromise();
    return response;
}