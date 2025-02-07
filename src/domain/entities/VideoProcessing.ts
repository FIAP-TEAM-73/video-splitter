import { assertArgumentUnionType, assertMinNumber } from "../base/AssertionConcerns";
import Email from "../value-objects/email";

const statuses = ['IN_PROGRESS', 'COMPLETED', 'ERROR'] as const;
export type VideoProcessingStatus = typeof statuses[number];

export default class VideoProcessing {
    constructor(
        readonly email: Email,
        readonly zipLink: string | undefined,
        readonly videoLink: string,
        readonly status: VideoProcessingStatus,
        readonly bucketKey: string | undefined,
        readonly interval: number,
        readonly createdAt: number = Date.now(),
        readonly updatedAt: number = Date.now()
    ) { 
        assertArgumentUnionType(status, Object.values(statuses), `Invalid status: ${status}`);
        assertMinNumber(interval, 1);
    }
}