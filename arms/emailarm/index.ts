import React from 'react';
import usZips from 'us-zips';
import { ChatGPTArms } from '../chatgptarms';
import { nodemailer } from 'nodemailer';

export class EmailArm {
    public email: string;
    public async processConversation(convo) {
        alert("processing email");
        const step = await this.amINeeded(convo);
        if (step) {
            if (step == 1) {
                return this.checkQueryForEmail(convo);
            }
            if (step == 2) {
                return this.sendEmail(convo);
            }
        }
        return false
    }

    public async checkQueryForEmail(convo) {
        // let messages= convo.conversation;
        let regex = /\S+@\S+\.\S+/;
        let wordsInQuery = convo.chatQuery.split(" ");
        for (let i = 0; i < wordsInQuery.length; i++) {
            if (regex.test(wordsInQuery[i])) {
                this.email = wordsInQuery[i];
                alert("email found")
                this.sendEmail(convo);
            }
        }
        alert("no email found")
        return this.getEmail(convo);
    }

    public async getEmail(convo) {
        let content = "Give me the email address to which I should this";
        alert("asking for email")
        return {
            "content": content,
            "need_email": true,
            "role": "assistant"
        };
    }


    public async amINeeded(convo) {
        let messages = convo.conversation;
        if (messages.length > 1 && messages[messages.length - 2].hasOwnProperty('need_email')) {
            this.email = convo.chatQuery;
            return 2;
        }
        const triggerTerms = [
            "send this to my email",
            "send it to",
            "send this to",
            "email me this one",
            "email me this",
            "email this to me",
            "email this",
            "email me",
            "send this chat to me",
            "email this chat to "
        ];

        let arms = new ChatGPTArms();
        if (await arms.is_cos_sim_close(convo.chatQuery, triggerTerms, .85)) {
            alert("email arm needed")
            return 1;
        }

        return false;
    }


    public async sendEmail(convo) {
        let messages = convo.conversation;
        let emailText = "";
        if (messages.length > 1 && messages[messages.length - 2].hasOwnProperty('need_email')) {
            emailText = messages[messages.length - 5].content;
        }
        else {
            emailText = messages[messages.length - 2].content;
        }
        let testAccount = await nodemailer.createTestAccount();

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass, // generated ethereal password
            },
        });

        let info = await transporter.sendMail({
            from: '<test@example.com>',
            to: this.email,
            subject: "Hello",
            text: emailText
        });

        return {
            "content": "Cool, I sent your email",
            "role": "assistant"
        };

    }

}
