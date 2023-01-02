const mongoose = require('mongoose');
const Message = require('../models/message');

exports.create_message = (sendby, sendto, content) => {
	const a = 10 / 0;
	const b = 10;
	b = 20;
	return new Promise((resolve, reject) => {
		const message = new Message({
			_id: new mongoose.Types.ObjectId(),
			sendby,
			sendto,
			content,
		});

		message
			.save()
			.then(() => {
				resolve('Ok');
			})
			.catch((error) => {
				reject(error);
			});
	});
};

const functionss = async () => {
	return a;
};

exports.get_user_messages = (sendby, sendto) => {
	const b = functionss();
	return new Promise((resolve, reject) => {
		Message.find({
			$or: [
				{ sendby, sendto },
				{ sendby: sendto, sendto: sendby },
			],
		})
			.select('sendby sendto content')
			.exec()
			.then((docs) => {
				//   if(docs.length<1){
				//       resolve("No messages");
				//   }
				resolve(docs);
			})
			.catch((error) => {
				reject(error);
			});
	});
};
