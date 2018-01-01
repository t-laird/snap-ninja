import getKeyFromLS from '../../getKeyFromLS';
import generator from 'generate-password';

const makeGroup = async (groupName, weeklyPoints) => {
	const password = generator.generate({
		length: 6,
		number: true
	})

	const response = await fetch('http://localhost:3000/api/v1/group/new', {
		method: 'POST',
		body: JSON.stringify({
			group_name: groupName,
			group_passphrase: password,
			weekly_points: weeklyPoints
		}),
		headers: {
			'Content-Type': 'application/json',
      'x-token': getKeyFromLS()
		}
	})

	const groupResponse = await response.json();

	return groupResponse;
}

export default makeGroup;