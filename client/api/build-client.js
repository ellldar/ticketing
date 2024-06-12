import axios from 'axios';

export default ({ req }) => {
	if (typeof window === 'undefined') {
		// We are on the SERVER SIDE
		return axios.create({
			baseURL: process.env.BASE_URL,
			headers: req.headers,
		});
	} else {
		// We are on the CLIENT SIDE
		return axios.create({
			baseURL: '/'
		})
	}
};