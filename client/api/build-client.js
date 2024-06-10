import axios from 'axios';

export default ({ req }) => {
	if (typeof window === 'undefined') {
		// We are on the SERVER SIDE
		return axios.create({
			baseURL: 'http://www.fabao.kg/',
			// baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
			headers: req.headers,
		});
	} else {
		// We are on the CLIENT SIDE
		return axios.create({
			baseURL: '/'
		})
	}
};