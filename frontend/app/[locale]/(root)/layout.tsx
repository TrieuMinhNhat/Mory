"use client"

import React from "react";
import AuthCheck from "@/components/shared/AuthProvider";
import LoadingScreen from "@/components/shared/LoadingScreen";
import ConnectionActionsDrawer from "@/components/user/connections/ConnectionActionsDrawer";
import StoryActionsDrawer from "@/components/user/story/StoryActionsDrawer";
import SendConnectionRequestsDialog from "@/components/user/connections/SendConnectionRequestDialog";
import MomentActionsDrawer from "@/components/user/moment/MomentActionsDrawer";
import CreateMomentDialog from "@/components/user/moment/CreateMomentDialog";
import UpdateStoryDialog from "@/components/user/story/update/UpdateStoryDialog";
import {useMomentCarouselStore} from "@/store/moment/useMomentCarouselStore";
import MomentCarousel from "@/components/user/moment/MomentCarousel";
import {useUpdateStoryDialogStore} from "@/store/story/useUpdateStoryDialogStore";
import {useSendConnectionRequestDialogStore} from "@/store/connection/useSendConnectionRequestDialogStore";
import {useConnectWithMeDialogStore} from "@/store/connection/useConnectWithMeDialogStore";
import ConnectWithMeDialog from "@/components/user/connections/home/ConnectWithMeDialog";
import {useUpdateMomentVisibilityDialogStore} from "@/store/moment/useUpdateMomentVisibilityDialogStore";
import UpdateMomentVisibilityDialog from "@/components/user/moment/UpdateMomentVisibilityDialog";
import {useConnectionLimitReachedDialogStore} from "@/store/connection/useConnectionLimitReachedDialogStore";
import ConnectionLimitReachedDialog from "@/components/user/connections/ConnectionLimitReachedDialog";
import {useLeaveStoryDialogStore} from "@/store/story/useLeaveStoryDialogStore";
import LeaveStoryDialog from "@/components/user/story/member/LeaveStoryDialog";

const CheckAuthLayout = ({
                             children
                         }: {
    children : React.ReactNode
}) => {
    const {open: momentCarouselOpen} = useMomentCarouselStore()
    const {open: updateStoryDialogOpen} = useUpdateStoryDialogStore();
    const {open: sendConnectionRequestsDialogOpen} = useSendConnectionRequestDialogStore();
    const {open: connectWithMeDialogOpen} = useConnectWithMeDialogStore();
    const {open: updateMomentVisibilityDialogOpen} = useUpdateMomentVisibilityDialogStore();
    const {open: connectionLimitReachedDialogOpen} = useConnectionLimitReachedDialogStore();
    const {open: leaveStoryDialogOpen} = useLeaveStoryDialogStore();

    return (
        <AuthCheck loadingFallback={<LoadingScreen />}>
            {children}
            <MomentActionsDrawer/>
            <ConnectionActionsDrawer />
            <StoryActionsDrawer/>
            {sendConnectionRequestsDialogOpen && <SendConnectionRequestsDialog/>}
            <CreateMomentDialog/>
            {updateStoryDialogOpen && <UpdateStoryDialog/>}
            {momentCarouselOpen && <MomentCarousel/>}
            {connectWithMeDialogOpen && <ConnectWithMeDialog/>}
            {updateMomentVisibilityDialogOpen && <UpdateMomentVisibilityDialog/>}
            {connectionLimitReachedDialogOpen && <ConnectionLimitReachedDialog/>}
            {leaveStoryDialogOpen && <LeaveStoryDialog/>}
        </AuthCheck>
    )
}

export default CheckAuthLayout;