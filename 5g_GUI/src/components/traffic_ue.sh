function identifyNFs() {
        PODS=$(minikube kubectl -- get pods | awk 'NR>1 {print $1}' | grep "^$1")
        NF_PODS=()
        for POD in $PODS; do
                POD_name=$(echo "$POD" | cut -d '/' -f 2)
                NF_PODS+=("$POD_name")
        done
        sleep 1
}

#Traffic script"
NF_type="ueransim-ue001"
identifyNFs $NF_type
minikube kubectl -- exec ${NF_PODS[1-1]} -- ping google.com -I uesimtun0 -c 5
