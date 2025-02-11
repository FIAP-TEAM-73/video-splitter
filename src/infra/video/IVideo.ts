export type StoreFramesParams = {
    path: string,
    outputPath: string
    frameTime: number
}

export interface IVideo {
    getDuration: (path: string) => Promise<{ duration: number }>
    storeFrames: (params: StoreFramesParams) => Promise<void>
}