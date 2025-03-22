package internal

import (
	"context"
	"fmt"
	"io"

	speech "cloud.google.com/go/speech/apiv1"
	"cloud.google.com/go/speech/apiv1/speechpb"
)

type STT struct {
	stream speechpb.Speech_StreamingRecognizeClient
}

func NewSTT(ctx context.Context, client *speech.Client) (*STT, error) {
	stream, err := client.StreamingRecognize(ctx)
	if err != nil {
		return nil, err
	}

	sendReq := &speechpb.StreamingRecognizeRequest{
		StreamingRequest: &speechpb.StreamingRecognizeRequest_StreamingConfig{
			StreamingConfig: &speechpb.StreamingRecognitionConfig{
				Config: &speechpb.RecognitionConfig{
					Encoding:        speechpb.RecognitionConfig_LINEAR16,
					SampleRateHertz: 16000,
					LanguageCode:    "ja-JP",
				},
			},
		},
	}
	if err := stream.Send(sendReq); err != nil {
		return nil, err
	}

	return &STT{
		stream: stream,
	}, nil
}

func (s *STT) SendAudio(ctx context.Context, audio []byte) error {
	sendReq := &speechpb.StreamingRecognizeRequest{
		StreamingRequest: &speechpb.StreamingRecognizeRequest_AudioContent{
			AudioContent: audio,
		},
	}
	if err := s.stream.Send(sendReq); err != nil {
		return err
	}
	return nil
}

func (s *STT) Close() error {
	return s.stream.CloseSend()
}

func (s *STT) Result() error {
	for {
		resp, err := s.stream.Recv()
		if err == io.EOF {
			break
		}
		if err != nil {
			return err
		}
		if err := resp.Error; err != nil {
			return fmt.Errorf("error: %v", err)
		}
		for _, result := range resp.Results {
			fmt.Printf("Result: %+v\n", result)
		}
	}
	return nil
}
